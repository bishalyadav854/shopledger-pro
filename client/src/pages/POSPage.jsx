import { useEffect, useMemo, useRef, useState } from 'react';
import { FiShoppingCart, FiTrash2, FiPrinter, FiSearch, FiPlusCircle } from 'react-icons/fi';
import { productService } from '../services/productService';
import { invoiceService } from '../services/invoiceService';
import { settingsService } from '../services/settingsService';

const money = (v) => `₹${Number(v || 0).toFixed(2)}`;

export default function POSPage() {
  const [barcode, setBarcode] = useState('');
  const [items, setItems] = useState([]);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState('');
  const [manualQty, setManualQty] = useState('1');
  const [taxPercent, setTaxPercent] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');
  const [customerDetails, setCustomerDetails] = useState({ name: '', mobile: '' });
  const [pendingMode, setPendingMode] = useState(false);
  const [settings, setSettings] = useState({ shopName: 'ShopLedger Store', address: '', gstNumber: '', taxPercentDefault: 0, logoUrl: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const barcodeRef = useRef(null);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity - (i.discount || 0), 0), [items]);
  const tax = useMemo(() => subtotal * Math.max(0, Number(taxPercent) || 0) / 100, [subtotal, taxPercent]);
  const total = Math.round((subtotal + tax) * 100) / 100;

  useEffect(() => { settingsService.get().then(r => { const d = r.data.data || {}; setSettings(p => ({ ...p, ...d })); setTaxPercent(String(d.taxPercentDefault ?? 0)); }).catch(() => {}); barcodeRef.current?.focus(); }, []);

  const addProductByBarcode = async (raw) => {
    const code = String(raw || barcode).trim(); if (!code) return;
    setMessage('');
    try {
      const response = await productService.getByBarcode(code);
      const p = response.data.data?.product || response.data.data;
      if (!p?._id) throw new Error('No registered product');
      setItems(prev => { const existing = prev.find(i => i.product === p._id); return existing ? prev.map(i => i.product === p._id ? { ...i, quantity: i.quantity + 1 } : i) : [...prev, { product: p._id, name: p.name, price: Number(p.sellingPrice), quantity: 1, discount: 0, stock: Number(p.quantity), barcode: p.barcode }]; });
      setMessage(`${p.name} added`);
    } catch {
      setMessage(`Barcode ${code} not found locally. Search catalog or add manually.`);
      try {
        const external = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`).then(r => r.json());
        if (external.status === 1) {
          const p = external.product || {};
          setManualName(p.product_name || p.product_name_en || '');
          setMessage(`External match found: ${p.product_name || 'Product'}. Confirm your own price and add manually.`);
        }
      } catch { /* manual fallback remains available */ }
    } finally { setBarcode(''); barcodeRef.current?.focus(); }
  };

  const addManual = () => {
    const name = manualName.trim(), price = Number(manualPrice), quantity = Number(manualQty);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity <= 0) { setMessage('Enter a product name, valid price and quantity.'); return; }
    setItems(prev => [...prev, { name, price, quantity, discount: 0 }]);
    setManualName(''); setManualPrice(''); setManualQty('1'); setMessage('Manual item added.');
  };

  const updateQty = (index, value) => setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: Math.max(0.01, Number(value) || 0.01) } : item));
  const finishSale = async () => {
    if (!items.length) { setMessage('Scan or add at least one item.'); return; }
    const paid = paidAmount === '' ? total : Number(paidAmount);
    if (!Number.isFinite(paid) || paid < 0 || paid > total) { setMessage('Paid amount must be between ₹0 and the total.'); return; }
    const due = Math.round((total - paid) * 100) / 100;
    if (due > 0 && (!customerDetails.name.trim() || !customerDetails.mobile.trim())) { setPendingMode(true); setMessage('Pending payment: enter customer name and mobile to save this due.'); return; }
    setBusy(true); setMessage('');
    try {
      const payload = { items: items.map(({ product, name, price, quantity, discount }) => ({ ...(product ? { product } : {}), name, price, quantity, discount: discount || 0 })), taxPercent: Number(taxPercent) || 0, paidAmount: paid, ...(due > 0 ? { customerDetails } : {}) };
      const response = await invoiceService.create(payload);
      const invoice = response.data.data;
      setMessage(`Sale saved as ${invoice.invoiceNumber || 'invoice'}. ${due > 0 ? 'Pending customer balance recorded.' : 'Payment complete.'}`);
      printReceipt(invoice);
      setItems([]); setPaidAmount(''); setCustomerDetails({ name: '', mobile: '' }); setPendingMode(false);
    } catch (e) { setMessage(e.response?.data?.message || 'Could not save sale. Check stock and try again.'); }
    finally { setBusy(false); barcodeRef.current?.focus(); }
  };

  const printReceipt = (invoice) => {
    const w = window.open('', '_blank', 'width=800,height=800');
    if (!w) { setMessage('Sale saved. Allow pop-ups to print the invoice.'); return; }
    const rows = (invoice.items || []).map(i => `<tr><td>${escapeHtml(i.name)}</td><td>${i.quantity}</td><td>${money(i.price)}</td><td>${money(i.price * i.quantity)}</td></tr>`).join('');
    w.document.write(`<!doctype html><html><head><title>${escapeHtml(settings.shopName)} invoice</title><style>body{font:14px Arial;margin:24px;color:#111}header{text-align:center;border-bottom:1px dashed #777;padding-bottom:12px}img{max-width:90px;max-height:60px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px 4px;border-bottom:1px solid #ddd;text-align:left}.totals{margin:18px 0 0 auto;width:240px}.totals p{display:flex;justify-content:space-between}.thanks{text-align:center;margin-top:28px}@media print{@page{size:auto;margin:8mm}}</style></head><body><header>${settings.logoUrl ? `<img src="${escapeAttr(settings.logoUrl)}" alt="logo"><br>` : ''}<h2>${escapeHtml(settings.shopName || 'ShopLedger Store')}</h2><p>${escapeHtml(settings.address || '')}</p><p>${settings.gstNumber ? 'GSTIN: '+escapeHtml(settings.gstNumber) : ''}</p><p>Thank you for shopping with us!</p><p>Invoice: ${escapeHtml(invoice.invoiceNumber || '')}</p></header><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><p><span>Subtotal</span><b>${money(invoice.subtotal)}</b></p><p><span>Tax (${Number(invoice.taxPercent || 0)}%)</span><b>${money(invoice.taxAmount)}</b></p><p><span>Total</span><b>${money(invoice.grandTotal)}</b></p><p><span>Paid</span><b>${money(invoice.paidAmount)}</b></p><p><span>Due</span><b>${money(invoice.pendingAmount)}</b></p></div><p class="thanks">Please visit again.</p><script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  };
  const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const escapeAttr = escapeHtml;

  return <div className="space-y-6 text-slate-100">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-indigo-300">Counter · Walk-in sales</p><h1 className="text-3xl font-bold">Quick POS</h1><p className="mt-1 text-slate-400">Scan, add items, collect payment and print. Customer details are optional for fully paid sales.</p></div><div className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3"><span className="text-xs text-slate-400">Current total</span><p className="text-2xl font-bold">{money(total)}</p></div></div>
    {message && <div role="status" className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-sm">{message}</div>}
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,.8fr)]">
      <section className="space-y-5 rounded-2xl border border-slate-700 bg-slate-800/60 p-5"><h2 className="text-lg font-semibold flex items-center gap-2"><FiShoppingCart/> Add items</h2><form className="flex gap-2" onSubmit={e => { e.preventDefault(); addProductByBarcode(); }}><input ref={barcodeRef} value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="Scan barcode and press Enter" className="min-w-0 flex-1 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-400"/><button className="rounded-xl bg-indigo-600 px-4 py-3 font-medium hover:bg-indigo-500">Scan / Find</button></form><p className="text-xs text-slate-400">USB scanners usually type the code and press Enter. Camera scanning can be added using the existing BarcodeScanner component if supported by the browser.</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_90px_auto]"><input value={manualName} onChange={e=>setManualName(e.target.value)} placeholder="Manual item name" className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"/><input type="number" min="0" step="0.01" value={manualPrice} onChange={e=>setManualPrice(e.target.value)} placeholder="Price ₹" className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"/><input type="number" min="0.01" step="0.01" value={manualQty} onChange={e=>setManualQty(e.target.value)} placeholder="Qty" className="rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"/><button type="button" onClick={addManual} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-600 px-3 py-2 hover:bg-slate-700"><FiPlusCircle/> Add</button></div>
      <div className="overflow-x-auto rounded-xl border border-slate-700"><table className="w-full min-w-[560px] text-sm"><thead className="bg-slate-900/70 text-slate-400"><tr><th className="p-3 text-left">Product</th><th className="p-3 text-right">Price</th><th className="p-3 text-center">Qty</th><th className="p-3 text-right">Amount</th><th className="p-3"></th></tr></thead><tbody>{items.map((item,index)=><tr key={`${item.product || item.name}-${index}`} className="border-t border-slate-700"><td className="p-3">{item.name}{item.stock !== undefined && <div className="text-xs text-slate-500">Stock: {item.stock}</div>}</td><td className="p-3 text-right">{money(item.price)}</td><td className="p-3 text-center"><input type="number" min="0.01" step="0.01" value={item.quantity} onChange={e=>updateQty(index,e.target.value)} className="w-20 rounded-lg bg-slate-900 p-2 text-center"/></td><td className="p-3 text-right">{money(item.price*item.quantity)}</td><td className="p-3"><button aria-label="Remove item" onClick={()=>setItems(prev=>prev.filter((_,i)=>i!==index))} className="text-rose-400"><FiTrash2/></button></td></tr>)}{!items.length && <tr><td colSpan="5" className="p-10 text-center text-slate-500">No items yet. Scan a barcode or add an item manually.</td></tr>}</tbody></table></div></section>
      <section className="space-y-5 rounded-2xl border border-slate-700 bg-slate-800/60 p-5"><h2 className="text-lg font-semibold">Payment & invoice</h2><label className="block text-sm text-slate-400">Tax / GST (%)<input type="number" min="0" max="100" step="0.01" value={taxPercent} onChange={e=>setTaxPercent(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 text-white"/></label><div className="space-y-2 rounded-xl bg-slate-900/70 p-4"><p className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span>{money(subtotal)}</span></p><p className="flex justify-between text-sm"><span className="text-slate-400">Tax</span><span>{money(tax)}</span></p><p className="flex justify-between border-t border-slate-700 pt-3 text-lg font-bold"><span>Total</span><span>{money(total)}</span></p></div><label className="block text-sm text-slate-400">Amount received (leave blank for full payment)<input type="number" min="0" max={total} step="0.01" value={paidAmount} onChange={e=>{setPaidAmount(e.target.value);setPendingMode(Number(e.target.value||total)<total)}} placeholder={money(total)} className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-3 text-white"/></label>{pendingMode && <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4"><h3 className="font-semibold text-amber-200">Pending payment — customer details required</h3><input value={customerDetails.name} onChange={e=>setCustomerDetails(p=>({...p,name:e.target.value}))} placeholder="Customer name *" className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"/><input value={customerDetails.mobile} onChange={e=>setCustomerDetails(p=>({...p,mobile:e.target.value}))} placeholder="Mobile number *" className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2"/><p className="text-xs text-slate-400">Customer is added to the pending ledger only when a balance remains.</p></div>}<button disabled={busy || !items.length} onClick={finishSale} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50">{busy ? 'Saving sale…' : 'Save sale & print invoice'}</button><button onClick={()=>{setItems([]);setPaidAmount('');setMessage('Draft cleared.');barcodeRef.current?.focus()}} className="w-full rounded-xl border border-slate-600 px-4 py-3 text-slate-300 hover:bg-slate-700">Clear draft</button><p className="text-xs text-slate-500">Stock changes only after the backend successfully saves the invoice. Manual items are not inventory-tracked.</p></section>
    </div>
  </div>;
}
