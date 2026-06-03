import { useDispatch } from "react-redux"
import { useSignoutMutation } from "@/models/profile"
import { invidiousApi } from "@/shared/api/invidiousAPI"

export const useLogout = () => {
  const dispatch = useDispatch()
  const [signout] = useSignoutMutation()

  return () => {
    void signout()
      .unwrap()
      .catch(() => {
        /* всё равно сбрасываем кэш */
      })
      .finally(() => {
        dispatch(invidiousApi.util.resetApiState())
      })
  }
}
