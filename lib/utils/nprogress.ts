import NProgress from "nprogress";

export const withProgress = async <T>(promise: Promise<T>): Promise<T> => {
  NProgress.start();
  try {
    const result = await promise;
    NProgress.done();
    return result;
  } catch (error) {
    NProgress.done();
    throw error;
  }
};