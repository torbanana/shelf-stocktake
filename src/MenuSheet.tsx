import { useLiveQuery } from 'dexie-react-hooks';
import { useRef, useState } from 'react';
import { ConfirmDialog, Sheet } from './components/Modal';
import { useToast } from './components/Toast';
import { db } from './db';
import { clearAllData, downloadJSON, exportBackup, importBackup } from './lib/backup';
import { csvTemplate, downloadCSV, importCSV, productsToCSV, type CsvImportResult } from './lib/csv';
import { loadSampleProducts, removeSampleProducts } from './lib/sample';
import type { Category, Product } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

export function MenuSheet({ open, onClose, products }: Props) {
  const toast = useToast();
  const categories = useLiveQuery(() => db.categories.orderBy('sortOrder').toArray(), [], [] as Category[]);
  const csvRef = useRef<HTMLInputElement>(null);
  const jsonRef = useRef<HTMLInputElement>(null);
  const [confirmSamples, setConfirmSamples] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [csvResult, setCsvResult] = useState<CsvImportResult | null>(null);
  const sampleCount = products.filter((p) => p.isSample).length;
  const stamp = () => new Date().toISOString().slice(0, 10);

  function onExportCSV() {
    downloadCSV(productsToCSV(products, categories), `shelf-${stamp()}.csv`);
    toast.show('CSV downloaded. Open it in Excel, Numbers or Google Sheets.');
    onClose();
  }

  function onTemplate() {
    downloadCSV(csvTemplate(), 'shelf-template.csv');
    toast.show('Template downloaded. Fill it in and import it here.');
  }

  async function onImportCSV(file: File | undefined) {
    if (!file) return;
    try {
      const r = await importCSV(await file.text());
      setCsvResult(r);
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      if (csvRef.current) csvRef.current.value = '';
    }
  }

  async function onExportJSON() {
    downloadJSON(await exportBackup(), `shelf-backup-${stamp()}.json`);
    toast.show('Backup downloaded.');
    onClose();
  }

  async function onImportJSON(file: File | undefined) {
    if (!file) return;
    try {
      const n = await importBackup(await file.text());
      toast.show(`Restored ${n} products.`);
      onClose();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      if (jsonRef.current) jsonRef.current.value = '';
    }
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Menu">
        <div className="menu-label">Spreadsheet (CSV)</div>
        <div className="menu">
          <button className="menu-item" onClick={() => csvRef.current?.click()}>
            <span>Import CSV</span>
            <span className="small muted">Adds new products and updates ones with the same name</span>
          </button>
          <button className="menu-item" onClick={onExportCSV} disabled={products.length === 0}>
            <span>Export CSV</span>
            <span className="small muted">Your shelf as a spreadsheet you can edit and re-import</span>
          </button>
          <button className="menu-item" onClick={onTemplate}>
            <span>Download CSV template</span>
            <span className="small muted">Name, Brand, Category, Quantity, Buy more when fewer than, Unit, Where to buy</span>
          </button>
        </div>

        <div className="menu-label">Other</div>
        <div className="menu">
          {sampleCount === 0 ? (
            <button
              className="menu-item"
              onClick={async () => {
                const n = await loadSampleProducts();
                toast.show(`${n} sample products added.`);
                onClose();
              }}
            >
              <span>Load sample products</span>
              <span className="small muted">Try the app with example items</span>
            </button>
          ) : (
            <button className="menu-item" onClick={() => setConfirmSamples(true)}>
              <span>Remove sample products</span>
              <span className="small muted">{sampleCount} loaded · your own products are kept</span>
            </button>
          )}
          <button className="menu-item" onClick={onExportJSON} disabled={products.length === 0}>
            <span>Full backup (JSON)</span>
            <span className="small muted">Exact copy of everything, for restoring on a new phone</span>
          </button>
          <button className="menu-item" onClick={() => jsonRef.current?.click()}>
            <span>Restore full backup</span>
            <span className="small muted">Pick a Shelf backup .json file</span>
          </button>
          <button className="menu-item danger" onClick={() => setConfirmClear(true)} disabled={products.length === 0}>
            <span>Delete everything</span>
            <span className="small muted">Removes all products from this device</span>
          </button>
        </div>
        <p className="tiny muted" style={{ textAlign: 'center' }}>
          Everything is stored in this browser only. Export a CSV or backup now and then.
        </p>
        <input ref={csvRef} type="file" accept=".csv,text/csv,text/plain" className="sr-only" tabIndex={-1} onChange={(e) => onImportCSV(e.target.files?.[0])} />
        <input ref={jsonRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={(e) => onImportJSON(e.target.files?.[0])} />
      </Sheet>

      <Sheet open={csvResult !== null} onClose={() => setCsvResult(null)} title="CSV imported">
        {csvResult && (
          <>
            <p>
              <strong>{csvResult.added}</strong> added · <strong>{csvResult.updated}</strong> updated
              {csvResult.skipped ? (
                <>
                  {' '}
                  · <strong>{csvResult.skipped}</strong> skipped
                </>
              ) : null}
            </p>
            {csvResult.problems.length > 0 && (
              <ul className="small muted" style={{ margin: 0, paddingLeft: 18 }}>
                {csvResult.problems.slice(0, 8).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
                {csvResult.problems.length > 8 && <li>and {csvResult.problems.length - 8} more</li>}
              </ul>
            )}
            <button
              className="btn primary block"
              onClick={() => {
                setCsvResult(null);
                onClose();
              }}
            >
              Done
            </button>
          </>
        )}
      </Sheet>

      <ConfirmDialog
        open={confirmSamples}
        title="Remove sample products?"
        message={`${sampleCount} sample products will be deleted. Products you added yourself are kept.`}
        confirmLabel="Remove"
        danger
        onConfirm={async () => {
          setConfirmSamples(false);
          const n = await removeSampleProducts();
          toast.show(`${n} sample products removed.`);
          onClose();
        }}
        onCancel={() => setConfirmSamples(false)}
      />
      <ConfirmDialog
        open={confirmClear}
        title="Delete everything?"
        message="All products will be permanently deleted from this device. Export a CSV or backup first if you might want them back."
        confirmLabel="Delete everything"
        danger
        onConfirm={async () => {
          setConfirmClear(false);
          await clearAllData();
          toast.show('All products deleted.');
          onClose();
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </>
  );
}
