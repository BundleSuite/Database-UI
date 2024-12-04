'use client'

import { usePathname } from "next/navigation";
import { BackButton } from "../back-button"

export function BackButtonWrapper() {
  const pathname = usePathname();
  return (
    <>
      {pathname !== "/" && <BackButton />}
    </>
  )
} 