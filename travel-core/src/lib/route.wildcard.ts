export const isPublicRoute = (url: string, publicRoutes: string[]): boolean => {
  const path = url;

  return publicRoutes.some((route) => {
    if (route.endsWith("/**")) {
      const base = route.replace("/**", "");
      return path.startsWith(base);
    }
    return path === route;
  });
};
