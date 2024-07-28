import type { GetStaticProps, InferGetStaticPropsType } from "next"
import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { MdChevronRight } from "react-icons/md"
import { Flex } from "@chakra-ui/react"

import { AllMetricData, BasePageProps, Lang } from "@/lib/types"
import type { CodeExample, CommunityEventsReturnType } from "@/lib/interfaces"

import BigNumber from "@/components/BigNumber"
import SvgButtonLink from "@/components/Buttons/SvgButtonLink"
import HomeHero from "@/components/Hero/HomeHero"
import HomeSection from "@/components/HomeSection"
import BlockHeap from "@/components/icons/block-heap.svg"
import EthTokenIcon from "@/components/icons/eth-token.svg"
import PickWalletIcon from "@/components/icons/eth-wallet.svg"
import ChooseNetworkIcon from "@/components/icons/network-layers.svg"
import TryAppsIcon from "@/components/icons/phone-homescreen.svg"
import RoadmapSign from "@/components/icons/roadmap-sign.svg"
import Whitepaper from "@/components/icons/whitepaper.svg"
import MainArticle from "@/components/MainArticle"
import PageMetadata from "@/components/PageMetadata"
import { TranslatathonBanner } from "@/components/Translatathon/TranslatathonBanner"

import { existsNamespace } from "@/lib/utils/existsNamespace"
import { getLastDeployDate } from "@/lib/utils/getLastDeployDate"
import { runOnlyOnce } from "@/lib/utils/runOnlyOnce"
import { getLocaleTimestamp } from "@/lib/utils/time"
import {
  getRequiredNamespacesForPage,
  isLangRightToLeft,
} from "@/lib/utils/translations"

import { BASE_TIME_UNIT } from "@/lib/constants"

import { ButtonLink } from "../../tailwind/ui/buttons/Button"

import CreateWalletContent from "!!raw-loader!@/data/CreateWallet.js"
import SimpleDomainRegistryContent from "!!raw-loader!@/data/SimpleDomainRegistry.sol"
import SimpleTokenContent from "!!raw-loader!@/data/SimpleToken.sol"
import SimpleWalletContent from "!!raw-loader!@/data/SimpleWallet.sol"
import { fetchCommunityEvents } from "@/lib/api/calendarEvents"
import { fetchNodes } from "@/lib/api/fetchNodes"
import { fetchTotalEthStaked } from "@/lib/api/fetchTotalEthStaked"
import { fetchTotalValueLocked } from "@/lib/api/fetchTotalValueLocked"
import { fetchTxCount } from "@/lib/api/fetchTxCount"
import buildersImage from "@/public/images/heroes/developers-hub-hero.jpg"
import activityImage from "@/public/images/heroes/layer-2-hub-hero.jpg"
import learnImage from "@/public/images/heroes/learn-hub-hero.png"
import communityImage from "@/public/images/heroes/quizzes-hub-hero.png"
import hero from "@/public/images/home/hero.png"

const cachedFetchCommunityEvents = runOnlyOnce(fetchCommunityEvents)
const cachedFetchTotalEthStaked = runOnlyOnce(fetchTotalEthStaked)
const cachedFetchNodes = runOnlyOnce(fetchNodes)
const cachedFetchTotalValueLocked = runOnlyOnce(fetchTotalValueLocked)
const cachedFetchTxCount = runOnlyOnce(fetchTxCount)

type Props = BasePageProps & {
  communityEvents: CommunityEventsReturnType
  metricResults: AllMetricData
}

export const getStaticProps = (async ({ locale }) => {
  const metricResults: AllMetricData = {
    totalEthStaked: await cachedFetchTotalEthStaked(),
    nodeCount: await cachedFetchNodes(),
    totalValueLocked: await cachedFetchTotalValueLocked(),
    txCount: await cachedFetchTxCount(),
  }

  const communityEvents = await cachedFetchCommunityEvents()

  // load i18n required namespaces for the given page
  const requiredNamespaces = getRequiredNamespacesForPage("/")

  // check if the translated page content file exists for locale
  const contentNotTranslated = !existsNamespace(locale!, requiredNamespaces[0])

  // load last deploy date to pass to Footer in RootLayout
  const lastDeployDate = getLastDeployDate()
  const lastDeployLocaleTimestamp = getLocaleTimestamp(
    locale as Lang,
    lastDeployDate
  )

  return {
    props: {
      ...(await serverSideTranslations(locale!, requiredNamespaces)),
      communityEvents,
      contentNotTranslated,
      lastDeployLocaleTimestamp,
      metricResults,
    },
    revalidate: BASE_TIME_UNIT * 24,
  }
}) satisfies GetStaticProps<Props>

const HomePage = ({
  communityEvents,
  metricResults,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { t } = useTranslation(["common", "page-index"])
  const { locale, asPath } = useRouter()
  const dir = isLangRightToLeft(locale as Lang) ? "rtl" : "ltr"

  const codeExamples: CodeExample[] = [
    {
      title: t("page-index:page-index-developers-code-example-title-0"),
      description: t(
        "page-index:page-index-developers-code-example-description-0"
      ),
      codeLanguage: "language-solidity",
      code: SimpleWalletContent,
    },
    {
      title: t("page-index:page-index-developers-code-example-title-1"),
      description: t(
        "page-index:page-index-developers-code-example-description-1"
      ),
      codeLanguage: "language-solidity",
      code: SimpleTokenContent,
    },
    {
      title: t("page-index:page-index-developers-code-example-title-2"),
      description: t(
        "page-index:page-index-developers-code-example-description-2"
      ),
      codeLanguage: "language-javascript",
      code: CreateWalletContent,
    },
    {
      title: t("page-index:page-index-developers-code-example-title-3"),
      description: t(
        "page-index:page-index-developers-code-example-description-3"
      ),
      codeLanguage: "language-solidity",
      code: SimpleDomainRegistryContent,
    },
  ]

  // TODO: Remove when used
  console.log("Values to use:", {
    communityEvents,
    metricResults,
    codeExamples,
  })

  const SubHeroCTAs = [
    {
      label: "Pick a wallet",
      description: "Create accounts, manage assets",
      href: "/wallets/find-wallet/",
      Svg: PickWalletIcon,
      colorClass: "text-primary",
    },
    {
      label: "Get ETH",
      description: "The currency of Ethereum",
      href: "/get-eth/",
      Svg: EthTokenIcon,
      colorClass: "text-accent-a",
    },
    {
      label: "Choose a network",
      description: "Enjoy minimal fees",
      href: "/layer-2/", // TODO: Update with new networks page when ready
      Svg: ChooseNetworkIcon,
      colorClass: "text-accent-b",
    },
    {
      label: "Try apps",
      description: "See what Ethereum can do",
      href: "/dapps/",
      Svg: TryAppsIcon,
      colorClass: "text-accent-c",
    },
  ]

  const popularTopics = [
    {
      label: "What is Ethereum?",
      Svg: EthTokenIcon,
      href: "/what-is-ethereum/",
    },
    {
      label: "What are crypto wallets?",
      Svg: PickWalletIcon,
      href: "/wallets/",
    },
    {
      label: "How to start? (step by step)",
      Svg: BlockHeap,
      href: "/guides/",
    },
    {
      label: "Ethereum Whitepaper",
      Svg: Whitepaper,
      href: "/whitepaper/",
    },
    {
      label: "Ethereum roadmap",
      Svg: RoadmapSign,
      href: "/roadmap/",
    },
  ]

  const comingSoon = [
    {
      title: "A new way to use the internet",
      tag: "Use cases",
    },
    { title: "The internet is changing", tag: "" },
    {
      title: "Bockchain's biggest builder community",
      tag: "Builders",
      imgSrc: buildersImage,
    },
    {
      title: "Built by the community",
      tag: "Ethereum.org community",
      imgSrc: communityImage,
      className: "flex-col-reverse",
    },
    { title: "Ethereum news", tag: "" },
    { title: "Ethereum events", tag: "" },
    { title: "Join ethereum.org", tag: "" },
  ]
  return (
    <Flex
      as={MainArticle}
      flexDirection="column"
      alignItems="center"
      dir={dir}
      width="full"
    >
      <PageMetadata
        title={t("page-index:page-index-meta-title")}
        description={t("page-index:page-index-meta-description")}
      />
      <TranslatathonBanner pathname={asPath} />
      <div className="w-full">
        <HomeHero heroImg={hero} />
      </div>

      <div className="space-y-16 px-4 md:px-6 lg:space-y-32">
        <div className="grid w-full grid-cols-2 gap-4 py-20 lg:grid-cols-4 lg:gap-x-10">
          {SubHeroCTAs.map(({ label, description, href, colorClass, Svg }) => (
            <SvgButtonLink
              key={label}
              Svg={Svg}
              href={href}
              label={label}
              className={colorClass}
            >
              {description}
            </SvgButtonLink>
          ))}
        </div>

        <HomeSection
          tag="Activity"
          title="The strongest ecosystem"
          imgSrc={activityImage}
        >
          <div className="mt-16 xl:mt-32">
            <p className="mt-8 text-xl font-bold">
              Activity from all Ethereum networks
            </p>
            <div className="grid w-full grid-cols-1 xl:grid-cols-2">
              {/* TODO: Plug in real data */}
              <BigNumber
                className="border-b border-body-light xl:border-e xl:pe-8"
                value="$44.89B"
                sourceName="Defi Llama"
              >
                Total value held on Ethereum
              </BigNumber>

              <BigNumber
                className="border-b border-body-light xl:ps-8"
                value="8.36M"
                sourceName="Etherscan"
                sourceUrl="https://etherscan.io/"
              >
                Transactions in the last 24h
              </BigNumber>

              <BigNumber
                className="border-b border-body-light xl:border-b-0 xl:border-e xl:pe-8"
                value="$0.01"
              >
                Average transaction cost
              </BigNumber>

              <BigNumber
                className="xl:ps-8"
                value="$115B"
                sourceName="Dune Analytics"
                sourceUrl="https://dune.xyz/"
              >
                Value protecting Ethereum
              </BigNumber>
            </div>
          </div>
        </HomeSection>

        <HomeSection
          tag="Learn"
          title="Understanding Ethereum"
          imgSrc={learnImage}
          className="lg:flex-row-reverse"
        >
          <div className="flex flex-col space-y-16 xl:space-y-32">
            <p className="text-lg">
              Cryptocurrency can feel overwhelming. Don&apos;t worry, these
              materials are designed to help you understand Ethereum in just a
              few minutes.
            </p>
            <div className="flex flex-col space-y-8">
              <p className="text-xl font-bold">Popular topics</p>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {popularTopics.map(({ label, Svg, href }) => (
                  <SvgButtonLink
                    key={label}
                    Svg={Svg}
                    href={href}
                    className="text-primary [&>:first-child]:flex-row"
                  >
                    <p className="text-start text-xl font-bold text-body">
                      {label}
                    </p>
                  </SvgButtonLink>
                ))}
              </div>
              <div className="flex justify-center py-8 lg:justify-start">
                <ButtonLink
                  linkProps={{ href: "/learn/" }}
                  className="w-fit text-lg"
                >
                  Other topics <MdChevronRight />
                </ButtonLink>
              </div>
            </div>
          </div>
        </HomeSection>

        {/* Temporary coming soon section template */}
        {comingSoon.map((item) => (
          <HomeSection {...item} key={item.title} />
        ))}
      </div>
    </Flex>
  )
}

export default HomePage
