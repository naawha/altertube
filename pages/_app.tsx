import "@mantine/core/styles.css"
import "shaka-player/dist/controls.css"
import "@/core/styles/shaka-overrides.css"
import "@/core/styles/globals.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { Provider } from "react-redux"
import { CoreProvider } from "@/core/providers"
import { wrapper } from "@/core/api/wrapper"
import MainLayout from "@/ensembles/MainLayout"

export default function App(props: AppProps) {
  const { store, props: combinedProps } = wrapper.useWrappedStore(props)
  const { Component, pageProps } = combinedProps

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
        <title>Piped Video</title>
        <meta name="description" content="Alternative Piped frontend for video" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Provider store={store}>
        <CoreProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </CoreProvider>
      </Provider>
    </>
  )
}
