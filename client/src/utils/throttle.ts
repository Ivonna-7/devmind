/**
 * 节流 + 防抖：滚动中按 delay 间隔触发（节流），停止后再补一次（防抖）。
 * 适合滚动监听这类高频事件 —— 过程中限流，停下来保证最终状态准确。
 */
export function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timer: ReturnType<typeof setTimeout>;
  let called = false;
  return () => {
    clearTimeout(timer);
    if (!called) {
      fn();
      called = true;
      setTimeout(() => (called = false), delay);
    } else {
      timer = setTimeout(fn, delay);
    }
  };
}
