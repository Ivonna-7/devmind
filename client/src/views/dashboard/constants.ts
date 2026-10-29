// 仪表盘三张 ECharts 图的 option 构建函数（纯函数：数据进、配置出，无响应式）
// 组件里用 computed 包一层注入响应式；此处只管「数据 → option」的映射。
import dayjs from "@/utils/dayjs";

/** 学习热力图 option（日历热力图，data 为按天统计卡片数量{date:string,count:number}；一年范围） */
/**
 * calendar = 底板(一整年的空格子都铺好,灰底白边,带月份星期刻度)
 * series = 往底板上"贴"有数据的天(只贴 count≥1 的)
 * visualMap = 决定这些贴上去的格子是什么颜色(1 张浅黄、6+ 深褐)
 * */
export const buildHeatmapOption = (
  data: { date: string; count: number }[],
) => ({
  title: {
    text: "学习热力图",
    subtext: `过去一年的学习活动 · 共 ${data.length} 天打卡`,
    left: 0,
    top: 0,
    textStyle: { color: "#1c1917", fontSize: 15.5, fontWeight: 600 },
    subtextStyle: { color: "#78716c", fontSize: 12 },
  },
  // 悬浮提示
  tooltip: {
    formatter: (p: any) =>
      p.value
        ? `${dayjs(p.value[0]).format("YYYY年M月D日")} · ${p.value[1]} 张卡片`
        : "",
  },
  visualMap: {
    show: true, // 显示图例控件
    type: "piecewise", // 分段式(非连续渐变)
    orient: "horizontal",
    right: 12,
    top: 4,
    itemWidth: 11,
    itemHeight: 11, // 色块大小
    itemGap: 4, // 色块间距
    text: ["多", "少"], //两端文字(注意顺序:高在前)
    textStyle: { color: "#78716c", fontSize: 11 },
    pieces: [
      // 分段规则:几张卡 → 什么色
      { min: 1, max: 1, color: "#FEF3C7", label: "" },
      { min: 2, max: 3, color: "#FDE68A", label: "" },
      { min: 4, max: 5, color: "#F59E0B", label: "" },
      { min: 6, color: "#B45309", label: "" },
    ],
  },
  calendar: {
    top: 84,
    bottom: 10,
    left: 44,
    right: 12,
    cellSize: ["auto", 14], // 格子尺寸:宽自适应、高 14px
    range: [
      dayjs().subtract(52, "week").format("YYYY-MM-DD"),
      dayjs().format("YYYY-MM-DD"),
    ], // 日历范围,range: [一年前, 今天]
    splitLine: { show: false }, // 不画月份分隔线(靠白边分格)
    itemStyle: { color: "#F1EEE8", borderColor: "#fff", borderWidth: 3 }, //"0 张卡"的底色
    yearLabel: { show: false },
    monthLabel: { color: "#78716c", fontSize: 11, margin: 10, nameMap: "ZH" },
    dayLabel: {
      color: "#a8a29e",
      fontSize: 10,
      nameMap: ["", "Mon", "", "Wed", "", "Fri", ""],
    },
  },
  series: {
    type: "heatmap", // 热力图类型
    coordinateSystem: "calendar", // 画在日历坐标系上
    data: data.map((p) => [p.date, p.count]), // 转成 [日期, 数量]
    // calendar.itemStyle → 空白天(没卡的格子)的底色 + 边;series.itemStyle → 有数据天(热力格子)的边(颜色由 visualMap 决定)
    itemStyle: { borderColor: "#fff", borderWidth: 3 },
  },
});

/** 掌握度环形饼图 option（rows 为 {name,value}；图例竖排右侧） */
export const buildPieOption = (
  rows: { name: string; value: number; color: string }[],
) => ({
  title: {
    text: "掌握度分布",
    subtext: `${rows.reduce((sum, r) => sum + r.value, 0)} 张卡片的记忆状态`,
    left: 0,
    top: 0,
    textStyle: { color: "#1c1917", fontSize: 15.5, fontWeight: 600 },
    subtextStyle: { color: "#78716c", fontSize: 12 },
  },
  // {b} — 数据名（name），这里是"新建/模糊/记得/已掌握";  {c} — 数据值（value），卡片张数; {d} — 百分比（percent），该档占总数的比例
  tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
  //图例，类别用 legend，数值深浅用 visualMap
  legend: {
    orient: "vertical",
    right: 8,
    top: 100,
    icon: "circle",
    itemWidth: 10,
    itemHeight: 10,
    itemGap: 24,
    textStyle: { color: "#57534e", fontSize: 12.5 },
  },
  series: [
    {
      type: "pie",
      radius: ["46%", "70%"], // 内外半径 → 中空环形（46% 内圈、70% 外圈）
      center: ["33%", "62%"], // 圆心位置（横 33% 偏左给图例让位、纵 62% 避开标题）
      label: { show: false },
      itemStyle: { borderColor: "#ffffff", borderWidth: 2 }, // 每段之间 2px 白缝，分隔更清爽
      data: rows.map((r) => ({
        name: r.name,
        value: r.value,
        itemStyle: { color: r.color },
      })),
    },
  ],
});

/** 横向条形图 option（rows 为 {name,value,color}） */
export const buildBarOption = (
  rows: { name: string; value: number; color: string }[],
) => ({
  title: {
    text: "卡片类型分布",
    subtext: "笔记 / 面试题 / Bug / TIL 各有多少张",
    left: 0,
    top: 0,
    textStyle: { color: "#1c1917", fontSize: 15.5, fontWeight: 600 },
    subtextStyle: { color: "#78716c", fontSize: 12 },
  },
  grid: { top: 56, bottom: 8, left: 8, right: 28, containLabel: true },
  xAxis: { type: "value", show: false },
  yAxis: {
    type: "category",
    inverse: true,
    data: rows.map((r) => r.name),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#57534e", fontSize: 12.5 }, //轴刻度文字	左侧"笔记/面试题/Bug/TIL"
  },
  series: [
    {
      type: "bar",
      barWidth: 14,
      data: rows.map((r) => ({
        value: r.value,
        itemStyle: { color: r.color, borderRadius: 4 },
      })),
      // 数据标注	柱子右端的数字
      label: {
        show: true,
        position: "right",
        color: "#1c1917",
        fontSize: 12,
        fontWeight: 600,
      },
    },
  ],
});
/** 技能雷达图 option（axes 为参与绘制的标签统计；各轴上界取最大值，至少 1） */
export const buildRadarOption = (axes: { name: string; count: string }[]) => {
  const maxCount = Math.max(1, ...axes.map((a) => Number(a.count)));
  return {
    title: {
      text: "知识版图",
      subtext: "高频标签勾勒的知识轮廓",
      left: 0,
      top: 0,
      textStyle: { color: "#1c1917", fontSize: 15.5, fontWeight: 600 },
      subtextStyle: { color: "#78716c", fontSize: 12 },
    },
    tooltip: { show: false },
    // 雷达坐标系
    radar: {
      //  轴的定义,数组几项就几根轴
      indicator: axes.map((a) => ({
        name: `${a.name} (${a.count})`, // 每根轴的名字,如 "设计模式 (31)"
        max: maxCount, // 这根轴的量程上限
      })),
      center: ["50%", "58%"], // 蜘蛛网中心位置（横 50% 居中、纵 58% 略偏下给标题让位）
      radius: "62%", // 网的半径（占容器 62%）
      splitNumber: 5, // 从中心到外画 5 圈（5 层同心多边形）
      axisName: { color: "#44403c", fontSize: 11 }, // 轴标签（设计模式/Vue 3…）的文字样式
      splitLine: { lineStyle: { color: "#e7e5e4" } }, // 同心圈的线（5 圈多边形的边），浅灰
      splitArea: { show: false }, // 圈与圈之间的填充色块，关掉（否则深浅相间）
      axisLine: { lineStyle: { color: "#e7e5e4" } }, // 从中心向外的放射轴线，浅灰
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: axes.map((a) => Number(a.count)),
            /**雷达图叠了两层:
             * 背景蜘蛛网(灰色的,由 radar 块配)——那张空网格
             * 数据多边形(橙色的,由 series 块配)——数据连成的形状,盖在网上
             **/
            areaStyle: { color: "rgba(180,83,9,0.18)" },
            lineStyle: { color: "#B45309", width: 1.2 },
            symbolSize: 3,              // 点
            itemStyle: { color: "#B45309" }, // 顶点的小圆点（棕色）
          },
        ],
      },
    ],
  };
};
