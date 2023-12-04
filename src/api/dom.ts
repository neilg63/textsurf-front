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
