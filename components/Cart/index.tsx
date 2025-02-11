import * as React from 'react'
import { useMedia } from '~/hooks'
import { BorrowCartItems, RepayCartItems } from './CartItems'
import { DesktopOnlyCart } from './Desktop'
import { MobileOnlyCart } from './Mobile'
import { Dialog, DialogHeading, useDialogState } from 'ariakit/dialog'
import type { IBorrowCartProps, IRepayCartProps } from './types'
import { useRouter } from 'next/router'
import Link from 'next/link'

function CartWrapper({ className, children }: { className?: string; children: React.ReactNode }) {
	const isDesktop = useMedia('(min-width: 80rem)', true)

	return (
		<React.Suspense fallback={null}>
			{isDesktop ? (
				<DesktopOnlyCart className={className}>{children}</DesktopOnlyCart>
			) : (
				<MobileOnlyCart>{children}</MobileOnlyCart>
			)}
		</React.Suspense>
	)
}

export function BorrowCart(props: IBorrowCartProps) {
	return <CartWrapper>{!props.isLoading && <BorrowCartItems {...props} />}</CartWrapper>
}

export function RepayCart(props: IRepayCartProps) {
	const router = useRouter()

	const { cart, ...queries } = router.query

	const isOpen = typeof cart === 'string' && cart === 'true'

	const dialog = useDialogState({
		open: isOpen,
		setOpen: (open) => {
			if (!open) {
				router.push({
					pathname: router.pathname,
					query: { ...queries }
				})
			}
		}
	})

	return (
		<Dialog
			state={dialog}
			portal={typeof window !== 'undefined'}
			className="dialog xl:mr-3 xl:h-screen xl:max-w-[22.5rem]"
			data-repaycart
		>
			<header className="flex items-center justify-between">
				<DialogHeading className="m-0 text-2xl font-medium">Checkout</DialogHeading>
				<Link href={router.asPath.split('?cart=true')[0]}>
					<a className="buttonDismiss">
						<span className="sr-only">Close checkout dialog</span>
						<svg
							aria-hidden="true"
							fill="none"
							height="10"
							viewBox="0 0 10 10"
							width="10"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1.70711 0.292893C1.31658 -0.0976311 0.683417 -0.0976311 0.292893 0.292893C-0.0976311 0.683417 -0.0976311 1.31658 0.292893 1.70711L3.58579 5L0.292893 8.29289C-0.0976311 8.68342 -0.0976311 9.31658 0.292893 9.70711C0.683417 10.0976 1.31658 10.0976 1.70711 9.70711L5 6.41421L8.29289 9.70711C8.68342 10.0976 9.31658 10.0976 9.70711 9.70711C10.0976 9.31658 10.0976 8.68342 9.70711 8.29289L6.41421 5L9.70711 1.70711C10.0976 1.31658 10.0976 0.683417 9.70711 0.292893C9.31658 -0.0976311 8.68342 -0.0976311 8.29289 0.292893L5 3.58579L1.70711 0.292893Z"
								fill="currentColor"
							></path>
						</svg>
					</a>
				</Link>
			</header>
			{!props.isLoading && <RepayCartItems {...props} />}
		</Dialog>
	)
}
