import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-cn";

// 相对时间插件（提供 fromNow()）+ 中文 locale，全局配置一次
dayjs.extend(relativeTime);
dayjs.locale("zh-cn");

export default dayjs;
