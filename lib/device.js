// There is no login. Each browser gets a random id so "My reports" can be shown.
export function getDeviceId() {
  try {
    let id = localStorage.getItem('deviceId');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'd-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('deviceId', id);
    }
    return id;
  } catch (e) {
    return 'anonymous';
  }
}
