import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

import localCache from "@/utils/cache";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/main",
    // redirect: "/main/analysis/videoAnalysis",
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login/login.vue"),
  },
  {
    path: "/main",
    name: "main",
    component: () => import("@/views/main/main.vue"),
    // children: [
    //   {
    //     path: "/main/analysis/videoAnalysis",
    //     component: () =>
    //       import("@/views/main/analysis/videoAnalysis/videoAnalysis.vue"),
    //   },
    //   {
    //     path: "/main/system/user",
    //     component: () => import("@/views/main/system/user/user.vue"),
    //   },
    //   {
    //     path: "/main/system/staff",
    //     component: () => import("@/views/main/system/staff/staff.vue"),
    //   },
    //   {
    //     path: "/main/authority/role",
    //     component: () => import("@/views/main/authority/role/role.vue"),
    //   },
    //   {
    //     path: "/main/video/videoManage",
    //     component: () =>
    //       import("@/views/main/videoCenter/videoManage/videoManage.vue"),
    //   },
    //   {
    //     path: "/main/video/videoUpload",
    //     component: () =>
    //       import("@/views/main/videoCenter/videoUpload/videoUpload.vue"),
    //   },
    //   {
    //     path: "/main/record/recordMessage",
    //     component: () => import("@/views/main/record/record.vue"),
    //   },
    //   {
    //     path: "/main/authority/authorityList",
    //     component: () =>
    //       import("@/views/main/authority/authorityList/authorityList.vue"),
    //   },
    //   {
    //     path: "/main/analysis/stateAnalysis",
    //     component: () =>
    //       import("@/views/main/analysis/stateAnalysis/stateAnalysis.vue"),
    //   },
    //   {
    //     path: "/main/app/swiper",
    //     component: () =>
    //       import("@/views/main/appManage/appSwiper/appSwiper.vue"),
    //   },
    // ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const getActiveRoute = async (authorityDetail: any): Promise<any> => {
  let activeRoute = <any>[];
  function getActiveRoute(authorityDetail: any) {
    for (let i of authorityDetail) {
      if (i.children.length >= 1 && i.type === "1") {
        getActiveRoute(i.children);
      } else {
        activeRoute.push(i.menuUrl);
      }
    }
    return activeRoute;
  }
  getActiveRoute(authorityDetail);
  return activeRoute;
};

let registerRouteFresh = true;
router.beforeEach(async (to, from, next) => {
  let staffAuthority = localCache.getCache("staffAuthority");

  const token = localCache.getCache("token");

  let activeRoute;
  if (staffAuthority) {
    activeRoute = await getActiveRoute(staffAuthority?.authorityList);
  }

  if (token) {
    if (registerRouteFresh) {
      activeRoute.forEach((route: any) => {
        router.addRoute("main", {
          path: route,
          component: () =>
            import(
              `@/views${route}/${
                route.split("/")[route.split("/").length - 1]
              }.vue`
            ),
        });
      });
      if (to.path == "/main") {
        next("/main/analysis/videoAnalysis");
      }
      next({ ...to, replace: true });
      registerRouteFresh = false;
    } else {
      next();
    }
  } else {
  
    if (to.path === "/login") {
      next();
    } else {
      next("/login");
    }
  }
  // if (to.path !== "/login") {
  //   const token = localCache.getCache("token");
  //   if (!token) {
  //     next("/login");
  //   }
  // }

  // if (to.path === "/main") {
  //   next("/main/analysis/videoAnalysis");
  // }
});

export default router;
