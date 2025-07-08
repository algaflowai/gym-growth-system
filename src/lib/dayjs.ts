import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/pt-br";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("pt-br");

export const BRAZIL_TZ = "America/Sao_Paulo";

// Helper function to get current date/time in Brazil timezone
export const nowInBrazil = () => dayjs().tz(BRAZIL_TZ);

// Helper function to format date in Brazilian format
export const formatBrazilianDate = (date: string | Date) => {
  return dayjs.tz(date, BRAZIL_TZ).format("DD/MM/YYYY");
};

// Helper function to format date and time in Brazilian format
export const formatBrazilianDateTime = (date: string | Date) => {
  return dayjs.tz(date, BRAZIL_TZ).format("DD/MM/YYYY HH:mm");
};

export default dayjs;