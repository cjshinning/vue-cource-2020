const getScrollParent = (el) => {
  let parent = el.parentNode;
  while (parent) {
    if (/(scroll)|(auto)/.test(getComputedStyle(parent)['overflow'])) {
      return parent;
    }
    parent = parent.parentNode;
  }
  return parent;
}

const loadImageAsync = (src, resolve, reject) => {
  let image = new Image();
  image.src = src;
  image.onload = resolve;
  image.onerror = reject;
}

const Lazy = (Vue) => {
  class ReactiveListener { //每一个图片元素
    constructor({ el, src, options, elRender }) {
      this.el = el;
      this.src = src;
      this.options = options;
      this.elRender = elRender;
      this.state = { loading: false };  //没有加载过
    }
    checkInView() {  //检测图片是否在可视区内
      console.log(this.el);
      let { top } = this.el.getBoundingClientRect();
      console.log(window.innerHeight);
      return top < window.innerHeight * (this.options.preLoad || 1.3);
    }
    load() { //用来加载这个图片
      // 先加载loading
      // 如果加载成功的话 显示正常图片
      this.elRender(this, 'loading');
      // 懒加载的核心 就是new Image
      loadImageAsync(this.src, () => {
        this.state.loading = true;
        this.elRender(this, 'finish');
      }, () => {
        this.elRender(this, 'error');
      })
    }
  }
  return class LazyClass {
    constructor(options) {
      this.options = options;
      this.bindHandler = false;
      this.listenerQueue = [];
    }
    handlerLazyLoad() {
      // 看一下是否应该显示这个图片
      // 计算当前图片的位置
      console.log(this.listenerQueue);
      this.listenerQueue.forEach(listener => {
        if (!listener.state.loading) {
          let catIn = listener.checkInView();
          catIn && listener.load();
        }
      })
    }
    add(el, bindings, vnode) {
      // 保存用户传入的属性
      Vue.nextTick(() => {
        let scrollParent = getScrollParent(el);
        if (scrollParent && !this.bindHandle) {
          this.bindHandle = true;
          scrollParent.addEventListener('scroll', this.handlerLazyLoad.bind(this));
        }
        // 需要判断当前这个元素是否在容器可视区中，如果不是就不用渲染
        const listener = new ReactiveListener({
          el,
          src: bindings.value,
          options: this.options,
          elRender: this.elRender.bind(this)
        });
        // 把所有的人都创建实例 放到数组中
        this.listenerQueue.push(listener);
        this.handlerLazyLoad();
      })
    }
    elRender(listener, state) { // 渲染方法
      let el = listener.el;
      let src = '';
      switch (state) {
        case 'loading':
          src = listener.options.loading || '';
          break;
        case 'error':
          src = listener.options.error || '';
          break;
        default:
          src = listener.src;
          break;
      }
      el.setAttribute('src', src);
    }
  }
}

const VueLazyload = {
  install(Vue, options) {
    // 把所有逻辑进行封装，类，把类在封装到函数
    const LazyClass = Lazy(Vue);
    const lazy = new LazyClass(options);
    Vue.directive('lazy', {
      bind: lazy.add.bind(lazy)
    })
  }
}