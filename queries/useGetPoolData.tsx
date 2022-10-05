import { ethers } from 'ethers'
import { useQuery } from '@tanstack/react-query'
import { IContractReadConfig, ITransactionError } from '~/types'
import { chainConfig } from '~/lib/constants'

interface IGetPoolDataArgs {
	contractArgs: IContractReadConfig | null
	chainId?: number | null
}

export interface IPoolData {
	name: string
	symbol: string
	maxLoanLength: number
	currentAnnualInterest: number
	maxInterestPerEthPerSecond: number
	nftContract: string
}

export async function getPool({ contractArgs, chainId }: IGetPoolDataArgs) {
	try {
		if (!chainId || !contractArgs) {
			return null
		}

		const { address, abi, provider } = contractArgs

		if (!provider) {
			throw new Error('Invalid arguments')
		}

		const contract = new ethers.Contract(address, abi, provider)

		const [name, symbol, maxLoanLength, currentAnnualInterest, maxInterestPerEthPerSecond, nftContract]: Array<string> =
			await Promise.all([
				contract.name(),
				contract.symbol(),
				contract.maxLoanLength(),
				contract.currentAnnualInterest(0),
				contract.maxInterestPerEthPerSecond(),
				contract.nftContract()
			])

		return {
			name,
			symbol,
			maxLoanLength: Number(maxLoanLength),
			currentAnnualInterest: Number(currentAnnualInterest),
			maxInterestPerEthPerSecond: Number(maxInterestPerEthPerSecond),
			nftContract
		}
	} catch (error: any) {
		throw new Error(error.message || (error?.reason ?? "Couldn't get pool data"))
	}
}

export function useGetPoolData({ chainId, address }: { chainId?: number | null; address?: string }) {
	const config = chainConfig(chainId)

	const contractArgs = address
		? {
				address,
				abi: config.poolABI,
				provider: config.chainProvider
		  }
		: null

	return useQuery<IPoolData | null, ITransactionError>(
		['pool', chainId, address],
		() => getPool({ contractArgs, chainId }),
		{
			refetchInterval: 30_000
		}
	)
}
