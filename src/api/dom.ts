export const addRootClass = (className: string, add = true) => {
  const cl = document.documentElement.classList;
  const hasClass = cl.contains(className);
  if (!hasClass && add !== false) {
    cl.add(className);
  } else if (hasClass && add === false) {
    cl.remove(className);
  }
};

export const removeRootClass = (className: string) => {
  addRootClass(className, false);
};

export const exitFullScreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    removeRootClass("fullscreen-widget");
  }
};

export const toggleFullScreen = (element: HTMLElement) => {
  if (!document.fullscreenElement) {
    element.requestFullscreen();
    addRootClass("fullscreen-widget");
  } else {
    exitFullScreen();
  }
};

export const toggleWidgetFullscreen = () => {
  const elem = document.getElementById("main-article");
  if (elem instanceof HTMLElement) {
    toggleFullScreen(elem);
  }
};


export const cleanInnerHtml = (html: string): string => {
  const wrapper = document.createElement("main");
  wrapper.innerHTML = html;
  const elsWithStyle = wrapper.querySelectorAll('[style]');
  for (const el of elsWithStyle) {
    el.removeAttribute('style');
  }
  const elsWithColor = wrapper.querySelectorAll('[bgcolor]');
  for (const el of elsWithColor) {
    el.removeAttribute('bgcolor');
  }
  const lis = wrapper.querySelectorAll('li');
  for (const el of lis) {
    const txtLen = el.textContent? el.textContent.trim().length : 0;
    if (txtLen < 1) {
      el.parentNode?.removeChild(el);
    }
  }
  return wrapper.innerHTML;
}