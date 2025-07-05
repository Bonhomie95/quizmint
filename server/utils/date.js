// 🔁 Is new week (Sunday as start of week)
function isNewWeek(lastDate, now = new Date()) {
  if (!lastDate) return true;
  const last = new Date(lastDate);
  return getWeekStart(last).toDateString() !== getWeekStart(now).toDateString();
}

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d;
}

// 📅 Is new month
function isNewMonth(lastDate, now = new Date()) {
  if (!lastDate) return true;
  const last = new Date(lastDate);
  return (
    last.getMonth() !== now.getMonth() ||
    last.getFullYear() !== now.getFullYear()
  );
}

module.exports = {
  isNewWeek,
  isNewMonth,
};
