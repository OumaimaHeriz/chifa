import { useEffect, useState } from 'react';

// ضع الرابط الخاص بملف التراخيص هنا (Gist أو Github Raw)
// يجب أن يكون الملف بصيغة JSON ويحتوي على:
// { "machine-id-123": "active", "machine-id-456": "expired" }
const LICENSE_URL = "https://gist.githubusercontent.com/YOUR_GIST_URL_HERE.json";

// فترة السماح في حال انقطاع الإنترنت (بالأيام). الافتراضي 3 أيام.
const GRACE_PERIOD_DAYS = 3;

export const useLicenseCheck = () => {
  const [isLicensed, setIsLicensed] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [machineId, setMachineId] = useState('');

  // توليد رقم تعريفي فريد للحاسوب عند أول تشغيل
  const getOrCreateMachineId = () => {
    let id = localStorage.getItem('chifa_machine_id');
    if (!id) {
      id = 'PHARM-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      localStorage.setItem('chifa_machine_id', id);
    }
    return id;
  };

  useEffect(() => {
    const checkLicense = async () => {
      const id = getOrCreateMachineId();
      setMachineId(id);

      // --- BYPASS FOR DEVELOPMENT ---
      setIsLicensed(true);
      setIsChecking(false);
      return;
      // ------------------------------

      try {
        // محاولة الاتصال بالإنترنت لجلب حالة الرخصة
        const response = await fetch(LICENSE_URL, { cache: 'no-store' });
        
        if (response.ok) {
          const licenses = await response.json();
          const status = licenses[id]; // قد يكون active أو expired أو undefined

          if (status === 'expired') {
            // تم إيقاف الرخصة من قبلك
            setIsLicensed(false);
            localStorage.setItem('chifa_license_status', 'expired');
          } else {
            // الرخصة مفعلة أو في فترة التجربة التلقائية
            setIsLicensed(true);
            localStorage.setItem('chifa_license_status', 'active');
            localStorage.setItem('chifa_last_sync', Date.now().toString());
          }
        } else {
          throw new Error('Server returned an error');
        }
      } catch (error) {
        // فشل الاتصال بالإنترنت، نتحقق من فترة السماح
        console.warn("Offline: Checking grace period...");
        const lastSync = localStorage.getItem('chifa_last_sync');
        const cachedStatus = localStorage.getItem('chifa_license_status');

        if (cachedStatus === 'expired') {
          // كان موقوفاً قبل انقطاع الإنترنت
          setIsLicensed(false);
        } else if (lastSync) {
          const now = Date.now();
          const syncTime = parseInt(lastSync, 10);
          const diffInDays = (now - syncTime) / (1000 * 60 * 60 * 24);

          if (diffInDays > GRACE_PERIOD_DAYS) {
            // انتهت فترة السماح دون إنترنت
            console.error("Grace period expired. Internet required.");
            setIsLicensed(false);
          } else {
            // لا يزال ضمن فترة السماح
            setIsLicensed(true);
          }
        } else {
          // أول مرة يفتح فيها البرنامج ولا يوجد إنترنت أصلاً (السماح مؤقتاً للبدء)
          setIsLicensed(true);
          localStorage.setItem('chifa_last_sync', Date.now().toString());
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkLicense();
  }, []);

  return { isLicensed, isChecking, machineId };
};
