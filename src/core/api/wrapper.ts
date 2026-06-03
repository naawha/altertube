import { createWrapper } from "next-redux-wrapper"

import { makeStore } from "./store"
import {
  generateServerSideResolverWrapper,
  ReduxWrapperConfig,
  ServiceConfigType,
} from "@naawha/next-rtk-wrapper"
import pipedService from "./pipedService"
import { GetServerSidePropsContext } from "next"

const SERVICE_CONFIG: ServiceConfigType = {
  authenticated: {
    service: pipedService,
    isAnonymous: false,
  },
  general: {
    service: pipedService,
    isAnonymous: true,
  },
}

const DEFAULT_CONFIG: ReduxWrapperConfig<GetServerSidePropsContext> = {
  general: [],
  authenticated: [],
}

export const wrapper = createWrapper(makeStore, {
  debug: process.env.NODE_ENV === "development",
})

export const serverSideDataResolverWrapper = generateServerSideResolverWrapper({
  wrapper,
  getUserState: async (ctx) => {
    let isAuthenticated = false
    let userState = undefined
    if (ctx.req.cookies["SID"] || ctx.req.cookies["authToken"]) {
      isAuthenticated = true
      userState = { isAuthenticated: true }
    }

    return { userState, isAuthenticated }
  },
  serviceConfig: SERVICE_CONFIG,
  defaultConfig: DEFAULT_CONFIG,
})
