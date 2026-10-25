import { useRef, useState } from 'react';
import { ConfirmDialog, Sheet } from './components/Modal';
import { useToast } from './components/Toast';
import { clearAllData, downloadJSON, exportBackup, importBackup } from './lib/backup';
import { loadSampleProducts, removeSampleProducts } from './lib/sample';
import type { Product } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

export function MenuSheet({ open, onClose, products }: Props) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmSamples, setConfirmSamples] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const sampleCount = products.filter((p) => p.isSample).length;

  async function onExport() {
    const data = await exportBackup();
    downloadJSON(data, `shelf-backup-${new Date().toISOString().slice(0, 10)}.json`);
    toast.show('Backup downloaded.');
    onClose();
  }

  async function onImport(file: File | undefined) {
    if (!file) return;
    try {
      const n = await importBackup(await file.text());
      toast.show(`Restored ${n} products.`);
      onClose();
    } catch (e) {
      toast.show(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Menu">
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
          <button className="menu-item" onClick={onExport} disabled={products.length === 0}>
            <span>Export backup</span>
            <span className="small muted">Saves a JSON file you can restore later</span>
          </button>
          <button className="menu-item" onClick={() => fileRef.current?.click()}>
            <span>Restore backup</span>
            <span className="small muted">Pick a Shelf backup file</span>
          </button>
          <button className="menu-item danger" onClick={() => setConfirmClear(true)} disabled={products.length === 0}>
            <span>Delete everything</span>
            <span className="small muted">Removes all products from this device</span>
          </button>
        </div>
        <p className="tiny muted" style={{ textAlign: 'center' }}>
          Everything is stored in this browser only. Export a backup before clearing browser data or changing phones.
        </p>
        <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={(e) => onImport(e.target.files?.[0])} />
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
        message="All products will be permanently deleted from this device. Export a backup first if you might want them back."
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
