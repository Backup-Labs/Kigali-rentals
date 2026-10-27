import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import {
  INITIAL_LISTINGS,
  INITIAL_INVENTORY_ITEMS,
  INITIAL_RESERVATIONS,
  INITIAL_ADMIN_TASKS,
  INITIAL_CONDITION_REPORTS,
  USD_TO_RWF_RATE,
} from '@/lib/mockData';
import {
  Listing,
  AssetInventoryItem,
  Reservation,
  AdminTask,
  ConditionReport,
} from '@/lib/types';

async function ensureCloudinaryUrls(urls: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const u of urls) {
    if (!u) continue;
    if (u.includes('res.cloudinary.com')) {
      results.push(u);
      continue;
    }
    if (u.startsWith('data:image/')) {
      try {
        const uploaded = await uploadImageToCloudinary(u, {
          folder: 'kigali-rentals/listings',
        });
        results.push(uploaded.url);
      } catch {
        results.push(u);
      }
    } else {
      results.push(u);
    }
  }
  return results;
}

async function seedIfEmpty() {
  const pool = getPool();
  const countRes = await pool.query('SELECT COUNT(*)::int AS cnt FROM kgl_listings');
  if (countRes.rows[0]?.cnt > 0) {
    return;
  }

  for (let i = 0; i < INITIAL_LISTINGS.length; i++) {
    const l = INITIAL_LISTINGS[i];
    await pool.query(
      `INSERT INTO kgl_listings (id, type, title, neighborhood, price_per_day, featured, sort_order, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [l.id, l.type, l.title, l.neighborhood, l.pricePerDay, Boolean(l.featured), i, JSON.stringify(l)]
    );
  }

  for (let i = 0; i < INITIAL_INVENTORY_ITEMS.length; i++) {
    const inv = INITIAL_INVENTORY_ITEMS[i];
    await pool.query(
      `INSERT INTO kgl_inventory (id, title, type, status, sort_order, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [inv.id, inv.title, inv.type, inv.status, i, JSON.stringify(inv)]
    );
  }

  for (const r of INITIAL_RESERVATIONS) {
    await pool.query(
      `INSERT INTO kgl_reservations (id, asset_id, status, created_at, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [r.id, r.assetId, r.status, r.createdAt, JSON.stringify(r)]
    );
  }

  for (let i = 0; i < INITIAL_ADMIN_TASKS.length; i++) {
    const t = INITIAL_ADMIN_TASKS[i];
    await pool.query(
      `INSERT INTO kgl_admin_tasks (id, asset_id, status, priority, sort_order, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [t.id, t.assetId, t.status, t.priority, i, JSON.stringify(t)]
    );
  }

  for (const rep of INITIAL_CONDITION_REPORTS) {
    await pool.query(
      `INSERT INTO kgl_condition_reports (id, booking_id, asset_id, stage, data, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [rep.id, rep.bookingId, rep.assetId, rep.stage, JSON.stringify(rep)]
    );
  }

  await pool.query(
    `INSERT INTO kgl_admins (id, email, username, password, name, role, badge_code, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     ON CONFLICT (id) DO NOTHING`,
    ['admin-01', 'admin@kigalirentals.rw', 'admin', 'Kigali@2026', 'Amani K.', 'Managing Director', 'AD-01']
  );
}

export async function GET() {
  try {
    await ensureSchema();
    await seedIfEmpty();
    const pool = getPool();

    const [listingsRes, invRes, resRes, tasksRes, reportsRes] = await Promise.all([
      pool.query('SELECT data FROM kgl_listings ORDER BY sort_order ASC, updated_at DESC'),
      pool.query('SELECT data FROM kgl_inventory ORDER BY sort_order ASC, updated_at DESC'),
      pool.query('SELECT data FROM kgl_reservations ORDER BY updated_at DESC'),
      pool.query('SELECT data FROM kgl_admin_tasks ORDER BY sort_order ASC, updated_at DESC'),
      pool.query('SELECT data FROM kgl_condition_reports ORDER BY updated_at DESC'),
    ]);

    return NextResponse.json({
      listings: listingsRes.rows.map((r) => r.data as Listing),
      inventory: invRes.rows.map((r) => r.data as AssetInventoryItem),
      reservations: resRes.rows.map((r) => r.data as Reservation),
      adminTasks: tasksRes.rows.map((r) => r.data as AdminTask),
      conditionReports: reportsRes.rows.map((r) => r.data as ConditionReport),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch from Aiven DB';
    console.error('[GET /api/rental-data] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const pool = getPool();
    const body = await req.json();
    const { action, payload } = body;

    switch (action) {
      case 'addListing': {
        const rawListing = payload.listing as Listing;
        const initialStatus: AssetInventoryItem['status'] = payload.initialStatus || 'Available';
        const cloudImages = await ensureCloudinaryUrls(rawListing.images || []);
        const listing: Listing = {
          ...rawListing,
          images: cloudImages,
        };

        await pool.query(
          `INSERT INTO kgl_listings (id, type, title, neighborhood, price_per_day, featured, sort_order, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, -1, $7, NOW())
           ON CONFLICT (id) DO UPDATE SET
             type = EXCLUDED.type,
             title = EXCLUDED.title,
             neighborhood = EXCLUDED.neighborhood,
             price_per_day = EXCLUDED.price_per_day,
             featured = EXCLUDED.featured,
             data = EXCLUDED.data,
             updated_at = NOW()`,
          [
            listing.id,
            listing.type,
            listing.title,
            listing.neighborhood,
            listing.pricePerDay,
            Boolean(listing.featured),
            JSON.stringify(listing),
          ]
        );

        const invItem: AssetInventoryItem = {
          id: listing.id,
          title: listing.title,
          type: listing.type,
          neighborhood: listing.neighborhood,
          status: initialStatus,
          pricePerDay: listing.pricePerDay,
          pricePerDayRwf: listing.pricePerDay * USD_TO_RWF_RATE,
          nextAvailableDate: 'Today',
          imageUrl: cloudImages[0] || '',
          specs: listing.specsSummary,
        };

        await pool.query(
          `INSERT INTO kgl_inventory (id, title, type, status, sort_order, data, updated_at)
           VALUES ($1, $2, $3, $4, -1, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             type = EXCLUDED.type,
             status = EXCLUDED.status,
             data = EXCLUDED.data,
             updated_at = NOW()`,
          [invItem.id, invItem.title, invItem.type, invItem.status, JSON.stringify(invItem)]
        );

        return NextResponse.json({ ok: true, listing, inventoryItem: invItem });
      }

      case 'updateListing': {
        const { id, updates, statusUpdate } = payload as {
          id: string;
          updates: Partial<Listing>;
          statusUpdate?: AssetInventoryItem['status'];
        };

        const existingRes = await pool.query('SELECT data FROM kgl_listings WHERE id = $1', [id]);
        if (existingRes.rows.length > 0) {
          const current = existingRes.rows[0].data as Listing;
          const cloudImages = updates.images
            ? await ensureCloudinaryUrls(updates.images)
            : current.images;
          const nextPrice = updates.pricePerDay ?? current.pricePerDay;
          const updated: Listing = {
            ...current,
            ...updates,
            images: cloudImages,
            pricePerDay: nextPrice,
            pricePerDayRwf: nextPrice * USD_TO_RWF_RATE,
          };

          await pool.query(
            `UPDATE kgl_listings
             SET type = $2, title = $3, neighborhood = $4, price_per_day = $5, featured = $6, data = $7, updated_at = NOW()
             WHERE id = $1`,
            [
              id,
              updated.type,
              updated.title,
              updated.neighborhood,
              updated.pricePerDay,
              Boolean(updated.featured),
              JSON.stringify(updated),
            ]
          );

          const invRes = await pool.query('SELECT data FROM kgl_inventory WHERE id = $1', [id]);
          if (invRes.rows.length > 0) {
            const curInv = invRes.rows[0].data as AssetInventoryItem;
            const updatedInv: AssetInventoryItem = {
              ...curInv,
              title: updated.title,
              type: updated.type,
              neighborhood: updated.neighborhood,
              pricePerDay: updated.pricePerDay,
              pricePerDayRwf: updated.pricePerDay * USD_TO_RWF_RATE,
              imageUrl: cloudImages[0] || curInv.imageUrl,
              specs: updated.specsSummary,
              status: statusUpdate ?? curInv.status,
            };
            await pool.query(
              `UPDATE kgl_inventory SET title = $2, type = $3, status = $4, data = $5, updated_at = NOW() WHERE id = $1`,
              [id, updatedInv.title, updatedInv.type, updatedInv.status, JSON.stringify(updatedInv)]
            );
          }

          return NextResponse.json({ ok: true, listing: updated });
        }

        return NextResponse.json({ ok: false, error: 'Listing not found' }, { status: 404 });
      }

      case 'deleteListing': {
        const { id } = payload as { id: string };
        await pool.query('DELETE FROM kgl_listings WHERE id = $1', [id]);
        await pool.query('DELETE FROM kgl_inventory WHERE id = $1', [id]);
        return NextResponse.json({ ok: true });
      }

      case 'createReservation': {
        const { reservation, autoTask } = payload as {
          reservation: Reservation;
          autoTask?: AdminTask;
        };
        await pool.query(
          `INSERT INTO kgl_reservations (id, asset_id, status, created_at, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             data = EXCLUDED.data,
             updated_at = NOW()`,
          [
            reservation.id,
            reservation.assetId,
            reservation.status,
            reservation.createdAt,
            JSON.stringify(reservation),
          ]
        );

        // Mark asset as Rented in inventory
        const invRes = await pool.query('SELECT data FROM kgl_inventory WHERE id = $1', [
          reservation.assetId,
        ]);
        if (invRes.rows.length > 0) {
          const curInv = invRes.rows[0].data as AssetInventoryItem;
          const updatedInv: AssetInventoryItem = {
            ...curInv,
            status: 'Rented',
            activeBookingId: reservation.id,
          };
          await pool.query(
            `UPDATE kgl_inventory SET status = $2, data = $3, updated_at = NOW() WHERE id = $1`,
            [reservation.assetId, 'Rented', JSON.stringify(updatedInv)]
          );
        }

        if (autoTask) {
          await pool.query(
            `INSERT INTO kgl_admin_tasks (id, asset_id, status, priority, sort_order, data, updated_at)
             VALUES ($1, $2, $3, $4, -1, $5, NOW())
             ON CONFLICT (id) DO NOTHING`,
            [
              autoTask.id,
              autoTask.assetId,
              autoTask.status,
              autoTask.priority,
              JSON.stringify(autoTask),
            ]
          );
        }

        return NextResponse.json({ ok: true });
      }

      case 'updateReservationStatus': {
        const { id, status } = payload as { id: string; status: Reservation['status'] };
        const resRow = await pool.query('SELECT data FROM kgl_reservations WHERE id = $1', [id]);
        if (resRow.rows.length > 0) {
          const updated: Reservation = {
            ...(resRow.rows[0].data as Reservation),
            status,
          };
          await pool.query(
            `UPDATE kgl_reservations SET status = $2, data = $3, updated_at = NOW() WHERE id = $1`,
            [id, status, JSON.stringify(updated)]
          );
        }
        return NextResponse.json({ ok: true });
      }

      case 'addTask': {
        const { task } = payload as { task: AdminTask };
        await pool.query(
          `INSERT INTO kgl_admin_tasks (id, asset_id, status, priority, sort_order, data, updated_at)
           VALUES ($1, $2, $3, $4, -1, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET
             status = EXCLUDED.status,
             priority = EXCLUDED.priority,
             data = EXCLUDED.data,
             updated_at = NOW()`,
          [task.id, task.assetId, task.status, task.priority, JSON.stringify(task)]
        );
        return NextResponse.json({ ok: true });
      }

      case 'updateTaskStatus': {
        const { taskId, status } = payload as { taskId: string; status: AdminTask['status'] };
        const taskRow = await pool.query('SELECT data FROM kgl_admin_tasks WHERE id = $1', [
          taskId,
        ]);
        if (taskRow.rows.length > 0) {
          const updated: AdminTask = {
            ...(taskRow.rows[0].data as AdminTask),
            status,
          };
          await pool.query(
            `UPDATE kgl_admin_tasks SET status = $2, data = $3, updated_at = NOW() WHERE id = $1`,
            [taskId, status, JSON.stringify(updated)]
          );
        }
        return NextResponse.json({ ok: true });
      }

      case 'deleteTask': {
        const { taskId } = payload as { taskId: string };
        await pool.query('DELETE FROM kgl_admin_tasks WHERE id = $1', [taskId]);
        return NextResponse.json({ ok: true });
      }

      case 'updateInventoryItem': {
        const { id, updates } = payload as {
          id: string;
          updates: Partial<AssetInventoryItem>;
        };
        const invRow = await pool.query('SELECT data FROM kgl_inventory WHERE id = $1', [id]);
        if (invRow.rows.length > 0) {
          const updatedInv: AssetInventoryItem = {
            ...(invRow.rows[0].data as AssetInventoryItem),
            ...updates,
          };
          await pool.query(
            `UPDATE kgl_inventory SET title = $2, type = $3, status = $4, data = $5, updated_at = NOW() WHERE id = $1`,
            [id, updatedInv.title, updatedInv.type, updatedInv.status, JSON.stringify(updatedInv)]
          );
        }
        return NextResponse.json({ ok: true });
      }

      case 'saveConditionReport': {
        const { report } = payload as { report: ConditionReport };
        await pool.query(
          `INSERT INTO kgl_condition_reports (id, booking_id, asset_id, stage, data, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (id) DO UPDATE SET
             stage = EXCLUDED.stage,
             data = EXCLUDED.data,
             updated_at = NOW()`,
          [report.id, report.bookingId, report.assetId, report.stage, JSON.stringify(report)]
        );

        // Also update reservation handoverStatus
        const resRow = await pool.query('SELECT data FROM kgl_reservations WHERE id = $1', [
          report.bookingId,
        ]);
        if (resRow.rows.length > 0) {
          const curRes = resRow.rows[0].data as Reservation;
          const updatedRes: Reservation = {
            ...curRes,
            handoverStatus: {
              ...curRes.handoverStatus,
              checkInDone:
                report.stage === 'check_in' ? true : curRes.handoverStatus.checkInDone,
              checkOutDone:
                report.stage === 'check_out' ? true : curRes.handoverStatus.checkOutDone,
            },
          };
          await pool.query(
            `UPDATE kgl_reservations SET data = $2, updated_at = NOW() WHERE id = $1`,
            [report.bookingId, JSON.stringify(updatedRes)]
          );
        }

        return NextResponse.json({ ok: true });
      }

      case 'resetDemoData': {
        await pool.query('TRUNCATE kgl_listings, kgl_inventory, kgl_reservations, kgl_admin_tasks, kgl_condition_reports');
        await seedIfEmpty();
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database operation failed';
    console.error('[POST /api/rental-data] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

