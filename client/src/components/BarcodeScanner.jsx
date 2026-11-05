import { useEffect, useRef, useState } from 'react';
import { FiCamera, FiCameraOff, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

/** Works with USB scanners that type the barcode and press Enter, plus camera scanning on supported browsers. */
export default function BarcodeScanner({ onScan, label = 'Barcode', placeholder = 'Scan or enter barcode', compact = false }) {
  const [value, setValue] = useState('');
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const busyRef = useRef(false);

  const submit = (raw = value) => {
    const code = String(raw || '').trim();
    if (!code) return;
    setValue('');
    onScan?.(code);
  };

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraOn]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const startCamera = async () => {
    if (!('BarcodeDetector' in window)) {
      toast.error('Camera barcode scanning is not supported in this browser. Use a USB scanner or Chrome/Edge on HTTPS/localhost.');
      return;
    }
    try {
      const supported = await window.BarcodeDetector.getSupportedFormats?.();
      detectorRef.current = new window.BarcodeDetector({
        formats: supported?.filter((f) => ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'].includes(f)) || ['ean_13','ean_8','upc_a','upc_e','code_128','code_39','qr_code'],
      });
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      setCameraOn(true);
      const scan = async () => {
        if (!streamRef.current) return;
        if (!busyRef.current && videoRef.current?.readyState >= 2) {
          busyRef.current = true;
          try {
            const codes = await detectorRef.current.detect(videoRef.current);
            if (codes?.[0]?.rawValue) {
              const code = codes[0].rawValue;
              stopCamera();
              submit(code);
              return;
            }
          } catch { /* camera frame may be temporarily unreadable */ }
          finally { busyRef.current = false; }
        }
        if (streamRef.current) window.setTimeout(scan, 180);
      };
      scan();
    } catch (error) {
      stopCamera();
      toast.error(error?.message || 'Unable to open camera. Check camera permissions.');
    }
  };

  return <div className="space-y-2">
    <label className="block text-sm text-slate-400">{label}</label>
    <div className="flex flex-col sm:flex-row gap-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} className="input-modern min-w-0 flex-1" placeholder={placeholder} inputMode="numeric" autoComplete="off" />
      <div className="flex gap-2">
        <button type="button" onClick={() => submit()} className="btn-secondary inline-flex items-center justify-center gap-2"><FiSearch /> Find</button>
        <button type="button" onClick={cameraOn ? stopCamera : startCamera} className="btn-secondary inline-flex items-center justify-center gap-2" title="Scan using camera">{cameraOn ? <FiCameraOff /> : <FiCamera />}<span className={compact ? 'hidden sm:inline' : ''}>{cameraOn ? 'Stop' : 'Camera'}</span></button>
      </div>
    </div>
    {cameraOn && <div className="rounded-xl border border-slate-700 p-2 max-w-md"><video ref={videoRef} muted playsInline className="w-full max-h-64 rounded-lg object-cover" /><p className="text-xs text-slate-400 mt-2">Hold the barcode steady inside the camera view.</p></div>}
    <p className="text-xs text-slate-500">USB scanners work like a keyboard: focus this field and scan. Camera scanning requires browser permission and a supported browser.</p>
  </div>;
}
