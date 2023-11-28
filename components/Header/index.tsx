/* eslint-disable no-unused-vars */
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useContext } from 'react'
import ThemeToggler from './ThemeToggler'
import menuData from './menuData'
import { UserCircle } from 'phosphor-react'
import * as Dialog from '@radix-ui/react-dialog'
import { parseCookies, destroyCookie } from 'nookies'
import axios from 'axios'
import { AccountContext } from '../../contexts/AccountContext'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const Header = () => {
  // Navbar toggle
  const [navbarOpen, setNavbarOpen] = useState(false)
  const [userNavbarOpen, setUserNavbarOpen] = useState(false)
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [userConnected, setUserConnected] = useState()
  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen)
  }
  const [isEditing, setIsEditing] = useState(false)
  const [isViewing, setIsViewing] = useState(false)
  const pathname = usePathname()
  const isFAQPage = pathname.includes('/faqs')
  const { push } = useRouter()

  const cookies = parseCookies()
  const userHasAnyCookie = cookies.userSessionToken

  const tagsOptions = [
    'Decentralized data infrastructure',
    'Dapps',
    'Analysis engine',
    'Research and development',
    'Validator',
  ]

  const {
    user,
    setUser,
    next,
    setNext,
    nextFromScratch,
    finalNodes,
    setReviewYourBuild,
    reviewYourBuild,
    setIsWorkspace,
    tagXnode,
    projectName,
    setProjectName,
    setTagXnode,
    isEditingXnode,
    setIsEditingXnode,
    setNextFromScratch,
    projectDescription,
    setProjectDescription,
    setXnodeType,
    xnodeType,
  } = useContext(AccountContext)

  // submenu handler
  const [openIndex, setOpenIndex] = useState(-1)
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1)
    } else {
      setOpenIndex(index)
    }
  }

  function onClickTrans(element: string) {
    const taskStartElement = document.getElementById(element)
    taskStartElement.scrollIntoView({ behavior: 'smooth' })
  }

  function signOutUser() {
    destroyCookie(undefined, 'userSessionToken')
    setUser(null)
  }

  const features = [
    {
      label: 'Browse',
      isCurrentlyPage: false,
      href: `/`,
    },
    {
      label: 'Become a data provider',
      isCurrentlyPage: false,
      href: `/become`,
    },
    {
      label: 'FAQs',
      isCurrentlyPage: false,
      href: `/faqs`,
    },
  ]

  const headerItens = [
    {
      label: 'About',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/openmesh-overview`,
    },
    {
      label: 'Use cases',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/use-cases`,
    },
    {
      label: 'Innovation',
      href: `https://open-mesh.gitbook.io/l3a-v3-documentation-2.0/openmesh/vision-and-roadmap`,
    },
    {
      label: 'Docs',
      href: `https://openmesh.network/xnode/docs`,
    },
  ]

  async function saveEditingXnode() {
    setIsLoadingUpdate(true)

    const savedNodes = localStorage.getItem('nodes')
    const savedEdges = localStorage.getItem('edges')
    const nodeId = localStorage.getItem('editingNode')

    const finalData = {
      xnodeId: nodeId,
      name: projectName,
      description: projectDescription,
      useCase: tagXnode,
      status: 'Running',
      consoleNodes: savedNodes,
      consoleEdges: savedEdges,
    }

    if (user.sessionToken) {
      const config = {
        method: 'put' as 'put',
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/xnodes/functions/updateXnode`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': user.sessionToken,
          'Content-Type': 'application/json',
        },
        data: finalData,
      }

      try {
        await axios(config).then(function (response) {
          if (response.data) {
            console.log('set next false yes')
            setNext(false)
            setNextFromScratch(false)
            toast.success(`Success`)
            localStorage.clear()
            push(
              `${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? `/xnode/dashboard`
                  : `/dashboard`
              }`,
            )
          }
        })
      } catch (err) {
        toast.error(
          `Error during Xnode deployment: ${err.response.data.message}`,
        )
      }
    } else {
      toast.error(`User nor found`)
      push(
        `${
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
            ? `/xnode/start-here`
            : `/start-here`
        }`,
      )
    }
    setIsLoadingUpdate(false)
  }

  async function getUserData() {
    const { userSessionToken } = parseCookies()
    if (userSessionToken) {
      const config = {
        method: 'post' as 'post',
        url: `${process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL}/openmesh-experts/functions/getCurrentUser`,
        headers: {
          'x-parse-application-id': `${process.env.NEXT_PUBLIC_API_BACKEND_KEY}`,
          'X-Parse-Session-Token': userSessionToken,
          'Content-Type': 'application/json',
        },
      }
      let dado

      await axios(config).then(function (response) {
        if (response.data) {
          dado = response.data
          setUser(dado)
        }
      })
    }
  }

  useEffect(() => {
    if (userHasAnyCookie) {
      try {
        getUserData()
      } catch (err) {
        destroyCookie(undefined, 'userSessionToken')
        setUser(null)
      }
    } else {
      localStorage.removeItem('@scalable: user-state-1.0.0')
      destroyCookie(undefined, 'userSessionToken')
      setUser(null)
    }

    const savedNodes = localStorage.getItem('nodes')
    const savedEdges = localStorage.getItem('edges')
    if (savedNodes && savedEdges) {
      setIsWorkspace(true)
    }

    const savedXnodeType = localStorage.getItem('xnodeType')

    setXnodeType(savedXnodeType)

    const isEditingX = localStorage.getItem('editingNode')
    if (isEditingX) {
      setIsEditingXnode(true)
    }
  }, [])

  // if ((next || nextFromScratch) && !reviewYourBuild) {
  //   return (
  //     <>
  //       <header className="top-0 left-0 z-40 mx-0 flex w-full items-center bg-[#fff]  pt-[45px] text-[#000000] md:pt-[54px] lg:pt-[62px] xl:pt-[72px] xl:pb-[27.8px] 2xl:pt-[90px] 2xl:pb-[46px]">
  //         <div className="w-full justify-between px-[20px] md:px-[33px] xl:hidden">
  //           <div className="">
  //             <img
  //               src={`${
  //                 process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
  //                   ? process.env.NEXT_PUBLIC_BASE_PATH
  //                   : ''
  //               }/images/new/openmesh-logo-new.png`}
  //               alt="image"
  //               className={`w-[150px]`}
  //             />
  //           </div>
  //           <button
  //             onClick={navbarToggleHandler}
  //             id="navbarToggler"
  //             aria-label="Mobile Menu"
  //             className="absolute right-7 top-7 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2"
  //           >
  //             <span
  //               className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
  //                 navbarOpen ? ' top-[7px] rotate-45' : ' '
  //               }`}
  //             />
  //             <span
  //               className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 ${
  //                 navbarOpen ? 'opacity-0 ' : ' '
  //               }`}
  //             />
  //             <span
  //               className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
  //                 navbarOpen ? ' top-[-8px] -rotate-45' : ' '
  //               }`}
  //             />
  //           </button>
  //           <nav
  //             id="navbarCollapse"
  //             className={`navbar absolute right-7 z-50 w-[250px] rounded border-[.5px] bg-[#e6e4e4] py-6  px-6 text-[13px] text-[#fff] duration-300  ${
  //               navbarOpen
  //                 ? 'visibility top-20 opacity-100'
  //                 : 'invisible top-20 opacity-0'
  //             }`}
  //           >
  //             <div className=" grid gap-y-[15px] text-[12px]  font-medium !leading-[19px]">
  //               <div className="my-auto flex text-center md:justify-center">
  //                 <a
  //                   href={`${process.env.NEXT_PUBLIC_BASE_URL}/community/register`}
  //                   className="flex cursor-pointer items-center rounded-[5px] bg-[#0354EC] py-[4.5px] px-[9px] text-[10px] font-bold !leading-[19px] text-[#fff] hover:border hover:border-[#0354EC] hover:bg-[#fff] hover:text-[#0354EC] md:py-[9px] md:px-[18px] md:text-[14px] 2xl:py-[11.5px] 2xl:px-[35px] 2xl:text-[16px]"
  //                 >
  //                   Schedule a call
  //                 </a>
  //               </div>
  //             </div>
  //           </nav>
  //         </div>
  //         <div className="mx-auto hidden h-full w-full max-w-[1800px] items-start justify-between px-[33px] xl:flex">
  //           <div className="flex items-center">
  //             <img
  //               src={`/images/header/user.svg`}
  //               alt="image"
  //               className="w-[16px] md:w-[19.2px] lg:w-[22.4px] xl:w-[25.5px] 2xl:w-[32px]"
  //             />
  //             {isEditing ? (
  //               <input
  //                 value={projectName}
  //                 onChange={(e) => setProjectName(e.target.value)}
  //                 onBlur={() => setIsEditing(false)}
  //                 className="ml-[5px] bg-[#fff]"
  //                 autoFocus
  //               />
  //             ) : (
  //               <div className="ml-[5px] text-[12px] font-bold text-[#313131] md:ml-[6px] md:text-[14.5px] lg:ml-[7px] lg:text-[17px] xl:ml-[8px] xl:text-[19px] 2xl:ml-[10px] 2xl:text-[24px]">
  //                 {projectName}
  //               </div>
  //             )}
  //             {isEditing ? (
  //               <div
  //                 onClick={() => setIsEditing(false)}
  //                 className="ml-[5px] cursor-pointer text-[7.5px] font-medium text-[#0354EC] md:ml-[6px] md:text-[8.5px] lg:ml-[7px] lg:text-[10px] xl:ml-[8px] xl:text-[11.2px] 2xl:ml-[10px] 2xl:text-[14px]"
  //               >
  //                 Save
  //               </div>
  //             ) : (
  //               <div
  //                 onClick={() => setIsEditing(true)}
  //                 className="ml-[5px] cursor-pointer text-[7.5px] font-medium text-[#0354EC] md:ml-[6px] md:text-[8.5px] lg:ml-[7px] lg:text-[10px] xl:ml-[8px] xl:text-[11.2px] 2xl:ml-[10px] 2xl:text-[14px]"
  //               >
  //                 Edit
  //               </div>
  //             )}
  //             <img
  //               src={`/images/header/config.svg`}
  //               alt="image"
  //               className="ml-[7.5px] w-[8px] md:ml-[9px] md:w-[10.8px] lg:ml-[10.5px] lg:w-[12.6px] xl:ml-[12px] xl:w-[14.5px] 2xl:ml-[15px] 2xl:w-[18px]"
  //             />
  //           </div>
  //           <div className="flex gap-x-[55px] md:gap-x-[66px] lg:gap-x-[77px] xl:gap-x-[88px] 2xl:gap-x-[110px]">
  //             <div className="">
  //               <div className="text-[7px] font-light md:text-[8.5px] lg:text-[10px] xl:text-[11.2px] 2xl:text-[14px]">
  //                 Estimated monthly price*
  //               </div>
  //               <div className="text-[13px] font-medium md:text-[15.5px] lg:text-[18px] xl:text-[21px] 2xl:text-[26px]">
  //                 $<span className="font-bold">40</span> / month
  //               </div>
  //               <div className="mt-[5px] flex justify-between">
  //                 <div className="text-[7px] text-[#12AD50]  md:text-[8.4px]  lg:text-[10px]  xl:text-[11.2px] 2xl:text-[14px]">
  //                   ~$13,000 savings
  //                 </div>
  //                 <img
  //                   src={`/images/header/question.svg`}
  //                   alt="image"
  //                   className="mb-[5px] w-[6.5px]  md:w-[7.8px]  lg:w-[9.1px] xl:w-[10.4px] 2xl:w-[13px]"
  //                 />
  //               </div>
  //             </div>
  //             <div className="grid gap-y-[12px] text-[7px]  font-medium md:text-[8.4px] lg:text-[10px] xl:text-[11.2px] 2xl:text-[14px]">
  //               <div className="flex h-fit cursor-pointer justify-center gap-x-[8px] rounded-[5px] bg-[#0354EC] py-[6.2px] px-[11px] text-center  text-[#fff] hover:bg-[#0e2e69]   md:py-[7.5px] md:px-[12.5px]    lg:py-[8.75px]  lg:px-[14.5px]  xl:py-[10px] xl:px-[17px]  2xl:gap-x-[10px] 2xl:py-[12.5px] 2xl:px-[21px]">
  //                 <img
  //                   src={`${
  //                     process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
  //                       ? process.env.NEXT_PUBLIC_BASE_PATH
  //                       : ''
  //                   }/images/header/storm.svg`}
  //                   alt="image"
  //                   className={`w-[5px] md:w-[6px] lg:w-[7px] xl:w-[8px] 2xl:w-[10px]`}
  //                 />
  //                 <div
  //                   onClick={() => {
  //                     console.log(finalNodes)
  //                     setReviewYourBuild(true)
  //                   }}
  //                 >
  //                   Create service and deploy
  //                 </div>
  //               </div>
  //               <div className="flex h-fit cursor-pointer justify-center gap-x-[5px]">
  //                 <img
  //                   src={`${
  //                     process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
  //                       ? process.env.NEXT_PUBLIC_BASE_PATH
  //                       : ''
  //                   }/images/header/arrow-down.svg`}
  //                   alt="image"
  //                   className={`w-[7px] md:w-[9px] lg:w-[10.5px] xl:w-[12px] 2xl:w-[15px]`}
  //                 />
  //                 <div className="text-[#959595] hover:text-[#7a7a7a]">
  //                   Download Service as PDF
  //                 </div>
  //               </div>
  //             </div>
  //           </div>

  //           {/* <div className="lg:hidden">
  //           <Dialog.Root>
  //             <Dialog.Trigger>
  //               <List className="text-black" size={24} weight="bold" />
  //             </Dialog.Trigger>
  //             <HeaderModal navigationItems={navigationItems} />
  //           </Dialog.Root>
  //         </div> */}
  //         </div>
  //       </header>
  //     </>
  //   )
  // }

  if (pathname.includes('/workspace') && !reviewYourBuild) {
    return (
      <>
        <header className="top-0 left-0 z-40 mx-0 w-full items-center bg-[#fff] px-[17px] pt-[7px]  text-[#000000] md:px-[20px] md:pt-[8px]  lg:px-[23px] lg:pt-[9px] xl:px-[26px] xl:pt-[10.5px] xl:pb-[27.8px] 2xl:px-[33px] 2xl:pt-[13px] 2xl:pb-[46px]">
          <div className="flex">
            <div className="w-full justify-between py-[20px] px-[20px] md:px-[33px] xl:hidden">
              <div className="">
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/new/openmesh-logo-new.png`}
                  alt="image"
                  className={`w-[150px]`}
                />
              </div>
              <button
                onClick={navbarToggleHandler}
                id="navbarToggler"
                aria-label="Mobile Menu"
                className="absolute right-7 top-5 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2"
              >
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                    navbarOpen ? ' top-[7px] rotate-45' : ' '
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 ${
                    navbarOpen ? 'opacity-0 ' : ' '
                  }`}
                />
                <span
                  className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                    navbarOpen ? ' top-[-8px] -rotate-45' : ' '
                  }`}
                />
              </button>
              <nav
                id="navbarCollapse"
                className={`navbar absolute right-7 z-50 w-[250px] rounded border-[.5px] bg-[#e6e4e4] py-6  px-6 text-[13px] text-[#fff] duration-300  ${
                  navbarOpen
                    ? 'visibility top-20 opacity-100'
                    : 'invisible top-20 opacity-0'
                }`}
              >
                <div className=" grid gap-y-[15px] text-[12px]  font-medium !leading-[19px]">
                  <div className="my-auto flex text-center md:justify-center">
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/community/register`}
                      className="flex cursor-pointer items-center rounded-[5px] bg-[#0354EC] py-[4.5px] px-[9px] text-[10px] font-bold !leading-[19px] text-[#fff] hover:border hover:border-[#0354EC] hover:bg-[#fff] hover:text-[#0354EC] md:py-[9px] md:px-[18px] md:text-[14px] 2xl:py-[11.5px] 2xl:px-[35px] 2xl:text-[16px]"
                    >
                      Schedule a call
                    </a>
                  </div>
                </div>
              </nav>
            </div>
            <div className="relative mx-auto hidden h-full w-full max-w-[1800px] items-center justify-between  xl:flex">
              <div className="flex items-center">
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/header/user.svg`}
                  alt="image"
                  className="w-[16px] md:w-[19.2px] lg:w-[22.4px] xl:w-[25.5px] 2xl:w-[23px]"
                />
                {isEditing ? (
                  <div className="mt-[20px]">
                    <div className="flex gap-x-[10px]">
                      <input
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="ml-[5px] bg-[#fff]"
                        autoFocus
                      />
                      <select
                        className="nodrag min-w-[104px] rounded-[6px] bg-[#fff] font-normal md:min-w-[124px] lg:min-w-[145px] xl:min-w-[167px] 2xl:min-w-[208px]"
                        onChange={(option) => setTagXnode(option.target.value)}
                        value={tagXnode}
                        disabled={xnodeType === 'validator'}
                      >
                        {tagsOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="ml-[5px] mt-[10px] flex">
                      <div> Description: </div>{' '}
                      <input
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className=" ml-[10px] bg-[#fff] text-[#999]"
                        autoFocus
                      />{' '}
                    </div>
                  </div>
                ) : (
                  <div className="ml-[5px] text-[8px] font-bold text-[#313131] md:ml-[6px] md:text-[9.6px] lg:ml-[7px] lg:text-[11.2px] xl:ml-[8px] xl:text-[13px] 2xl:ml-[10px] 2xl:text-[16px]">
                    {projectName}
                  </div>
                )}
                {isEditing ? (
                  <div
                    onClick={() => setIsEditing(false)}
                    className="ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]"
                  >
                    Save
                  </div>
                ) : (
                  <div
                    onClick={() => setIsEditing(true)}
                    className="ml-[20px] cursor-pointer text-[7.5px] font-medium text-[#0354EC]  underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[24px] md:text-[8.5px] lg:ml-[28px] lg:text-[10px] xl:ml-[32px] xl:text-[11.2px] 2xl:ml-[40px] 2xl:text-[14px]"
                  >
                    Edit
                  </div>
                )}
                {isViewing ? (
                  <div
                    onClick={() => setIsViewing(false)}
                    className="ml-[7.5px] cursor-pointer text-[7.5px] font-medium  text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]"
                  >
                    Hide
                  </div>
                ) : (
                  <div
                    onClick={() => setIsViewing(true)}
                    className="ml-[7.5px] cursor-pointer text-[7.5px] font-medium text-[#0354EC] underline underline-offset-[3px] hover:text-[#023ba5] md:ml-[9px] md:text-[8.5px] lg:ml-[10.5px] lg:text-[10px] xl:ml-[12px] xl:text-[11.2px] 2xl:ml-[15px] 2xl:text-[14px]"
                  >
                    View
                  </div>
                )}
              </div>
              <div className="relative flex gap-x-[25px] text-[7px] md:gap-x-[30px] md:text-[8.4px] lg:gap-x-[35px]  lg:text-[10px]  xl:gap-x-[40px] xl:text-[11.2px] 2xl:gap-x-[50px] 2xl:text-[14px]">
                {/* <div className="">
                <div className="text-[7px] font-light md:text-[8.5px] lg:text-[10px] xl:text-[11.2px] 2xl:text-[14px]">
                  Estimated monthly price*
                </div>
                <div className="text-[13px] font-medium md:text-[15.5px] lg:text-[18px] xl:text-[21px] 2xl:text-[26px]">
                  $<span className="font-bold">40</span> / month
                </div>
                <div className="mt-[5px] flex justify-between">
                  <div className="text-[7px] text-[#12AD50]  md:text-[8.4px]  lg:text-[10px]  xl:text-[11.2px] 2xl:text-[14px]">
                    ~$13,000 savings
                  </div>
                  <img
                    src={`/images/header/question.svg`}
                    alt="image"
                    className="mb-[5px] w-[6.5px]  md:w-[7.8px]  lg:w-[9.1px] xl:w-[10.4px] 2xl:w-[13px]"
                  />
                </div>
              </div> */}
                <div className="flex items-center gap-x-[15px] font-medium text-[#000] md:gap-x-[18px] lg:gap-x-[21px] xl:gap-x-[24px] 2xl:gap-x-[30px]">
                  {headerItens.map((option, index) => (
                    <a
                      key={index}
                      href={`${
                        process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                          ? `/xnode${option.href}`
                          : `${option.href}`
                      }`}
                    >
                      <div className="hover:text-[#313131]">{option.label}</div>
                    </a>
                  ))}
                </div>
                <div className="grid gap-y-[12px] font-medium">
                  {isEditingXnode ? (
                    <div
                      onClick={async () => {
                        if (!isLoadingUpdate) {
                          await saveEditingXnode()
                        }
                      }}
                      className={`flex h-fit cursor-pointer justify-center gap-x-[8px] rounded-[5px] ${
                        isLoadingUpdate
                          ? 'bg-[#3c78e9]'
                          : 'bg-[#0354EC] hover:bg-[#203b6e]'
                      }  py-[6.2px] px-[11px] text-center  text-[#fff]    md:py-[7.5px] md:px-[12.5px]    lg:py-[8.75px]  lg:px-[14.5px]  xl:py-[10px] xl:px-[17px]  2xl:gap-x-[10px] 2xl:py-[10px] 2xl:px-[21px]`}
                    >
                      <img
                        src={`${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                            ? process.env.NEXT_PUBLIC_BASE_PATH
                            : ''
                        }/images/header/storm.svg`}
                        alt="image"
                        className={`w-[5px] md:w-[6px] lg:w-[7px] xl:w-[8px] 2xl:w-[10px]`}
                      />
                      <div>Save updates</div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        push(
                          `${
                            process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                              ? `/xnode/review-your-build`
                              : `/review-your-build`
                          }`,
                        )
                      }}
                      className="flex h-fit cursor-pointer justify-center gap-x-[8px] rounded-[5px] bg-[#0354EC] py-[6.2px] px-[11px] text-center  text-[#fff] hover:bg-[#203b6e]   md:py-[7.5px] md:px-[12.5px]    lg:py-[8.75px]  lg:px-[14.5px]  xl:py-[10px] xl:px-[17px]  2xl:gap-x-[10px] 2xl:py-[10px] 2xl:px-[21px]"
                    >
                      <img
                        src={`${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                            ? process.env.NEXT_PUBLIC_BASE_PATH
                            : ''
                        }/images/header/storm.svg`}
                        alt="image"
                        className={`w-[5px] md:w-[6px] lg:w-[7px] xl:w-[8px] 2xl:w-[10px]`}
                      />
                      <div>Create service and deploy</div>
                    </div>
                  )}
                </div>
                {user?.sessionToken ? (
                  <div>
                    <img
                      src={
                        !user.profilePictureHash
                          ? `${
                              process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                                ? process.env.NEXT_PUBLIC_BASE_PATH
                                : ''
                            }/images/header/user-circle.svg`
                          : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                      }
                      alt="image"
                      onClick={() => {
                        setUserNavbarOpen(!userNavbarOpen)
                      }}
                      className={`mr-[15px] h-[50px] w-[50px] cursor-pointer rounded-[100%] 2xl:mr-[15px]`}
                    />
                    <nav
                      className={`navbar absolute right-[100px] z-50 flex w-[150px] rounded-[8px] border-[.5px] bg-[#e6e4e4] pt-[19px] pr-1 pl-[15px] pb-[30px] text-[13px] text-[#fff] duration-300  ${
                        userNavbarOpen
                          ? 'visibility top-20 -right-[50px] opacity-100'
                          : 'invisible top-20 opacity-0'
                      }`}
                    >
                      <div className="mt-[10px]">
                        <div className="mt-[25px]">
                          <a
                            onClick={signOutUser}
                            className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent py-[6px] px-[18px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]"
                          >
                            Sign out
                          </a>
                        </div>
                      </div>
                      <div
                        onClick={() => {
                          setUserNavbarOpen(false)
                        }}
                        className="ml-[20px]  flex cursor-pointer justify-end text-[16px] font-bold text-[#000] hover:text-[#313131]"
                      >
                        x
                      </div>
                    </nav>
                  </div>
                ) : (
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? `/xnode/login`
                        : `${'/login'}`
                    }`}
                    className=" my-auto h-fit cursor-pointer items-center   border-b  border-[#000] bg-transparent text-[16px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]"
                  >
                    Login
                  </a>
                )}
              </div>

              {/* <div className="lg:hidden">
            <Dialog.Root>
              <Dialog.Trigger>
                <List className="text-black" size={24} weight="bold" />
              </Dialog.Trigger>
              <HeaderModal navigationItems={navigationItems} />
            </Dialog.Root>
          </div> */}
            </div>
          </div>
          {isViewing && (
            <div className="pl-[17px]  md:pl-[20px] lg:pl-[23px] xl:pl-[26.4px] 2xl:pl-[33px] ">
              <div className="base:text-[7px] mt-[5px] md:text-[8.4px] lg:text-[9.8px] xl:text-[11.2px] 2xl:text-[14px]">
                {tagXnode}
              </div>
              <div className="mt-[10px] flex justify-between">
                <div className="text-[6px] font-medium text-[#8D8D8D] md:text-[7.2px]  lg:text-[8.4px]  xl:text-[9.6px] 2xl:text-[12px]">
                  {projectDescription}
                </div>
                <div className="mt-[5px] md:mt-[6px] lg:mt-[7px] xl:mt-[8px] 2xl:mt-[1px]">
                  <div className="text-[9px] font-medium text-[#000] md:text-[10.8px] lg:text-[12.6px] xl:text-[14.4px] 2xl:text-[18px]">
                    Est. $<span className="font-bold">40</span> / month
                  </div>
                  <div className="relative mx-auto mt-[1px] flex w-fit">
                    <div className="text-[6px] font-medium  text-[#12AD50] md:text-[7.2px]  lg:text-[8.4px]  xl:text-[11.2px] 2xl:text-[12px]">
                      ~$13,000 savings
                    </div>
                    <img
                      src={`${
                        process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                          ? process.env.NEXT_PUBLIC_BASE_PATH
                          : ''
                      }/images/header/question.svg`}
                      alt="image"
                      className="absolute top-0 -right-[10px] w-[4px]  md:w-[4.8px]  lg:w-[5.6px] xl:w-[6.4px] 2xl:w-[8px]"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-x-[30px]">
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/header/components.png`}
                  alt="image"
                  className={`mt-[8.5px] w-[170px] md:mt-[10px] md:w-[204px] lg:mt-[12px] lg:w-[238px] xl:mt-[13.6px] xl:w-[272px] 2xl:mt-[17px] 2xl:w-[340px]`}
                />
                <div className=" mt-auto mb-[5px]">
                  <a
                    href={`${
                      process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                        ? `/xnode/data-products`
                        : `${'/data-products'}`
                    }`}
                    className=" cursor-pointer text-[6px] font-medium  text-[#0354EC] hover:text-[#023ba5] md:text-[7.2px]  lg:text-[8.4px] xl:text-[11.2px] 2xl:text-[12px]"
                  >
                    More
                  </a>
                </div>
              </div>
            </div>
          )}
        </header>
      </>
    )
  }

  return (
    <>
      <header className="top-0 left-0 z-40 mx-0 flex w-full items-center bg-[#fff]  pt-[7px] text-[#000000] md:pt-[8px] lg:pt-[9px] xl:pt-[10.5px] xl:pb-[27.8px] 2xl:pt-[13px] 2xl:pb-[46px]">
        <div className="w-full justify-between py-[20px] px-[20px] md:px-[33px] xl:hidden">
          <div className="">
            <img
              src={`${
                process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                  ? process.env.NEXT_PUBLIC_BASE_PATH
                  : ''
              }/images/new/openmesh-logo-new.png`}
              alt="image"
              className={`w-[150px]`}
            />
          </div>
          <button
            onClick={navbarToggleHandler}
            id="navbarToggler"
            aria-label="Mobile Menu"
            className="absolute right-7 top-5 block  rounded-lg px-3 py-[6px] ring-primary focus:ring-2"
          >
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                navbarOpen ? ' top-[7px] rotate-45' : ' '
              }`}
            />
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 ${
                navbarOpen ? 'opacity-0 ' : ' '
              }`}
            />
            <span
              className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300  ${
                navbarOpen ? ' top-[-8px] -rotate-45' : ' '
              }`}
            />
          </button>
          <nav
            id="navbarCollapse"
            className={`navbar absolute right-7 z-50 w-[250px] rounded border-[.5px] bg-[#e6e4e4] py-6  px-6 text-[13px] text-[#fff] duration-300  ${
              navbarOpen
                ? 'visibility top-20 opacity-100'
                : 'invisible top-20 opacity-0'
            }`}
          >
            <div className=" grid gap-y-[15px] text-[12px]  font-medium !leading-[19px]">
              <div className="my-auto flex text-center md:justify-center">
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/community/register`}
                  className="flex cursor-pointer items-center rounded-[5px] bg-[#0354EC] py-[4.5px] px-[9px] text-[10px] font-bold !leading-[19px] text-[#fff] hover:border hover:border-[#0354EC] hover:bg-[#fff] hover:text-[#0354EC] md:py-[9px] md:px-[18px] md:text-[14px] 2xl:py-[11.5px] 2xl:px-[35px] 2xl:text-[16px]"
                >
                  Schedule a call
                </a>
              </div>
            </div>
          </nav>
        </div>
        <div className="relative mx-auto hidden h-full w-full max-w-[1800px] items-center justify-between px-[33px] xl:flex">
          <div></div>
          <div className="flex items-center gap-x-[15px] font-medium text-[#000] md:gap-x-[18px] lg:gap-x-[21px] xl:gap-x-[24px] 2xl:gap-x-[30px]">
            {/* <div className="">
              <div className="text-[7px] font-light md:text-[8.5px] lg:text-[10px] xl:text-[11.2px] 2xl:text-[14px]">
                Estimated monthly price*
              </div>
              <div className="text-[13px] font-medium md:text-[15.5px] lg:text-[18px] xl:text-[21px] 2xl:text-[26px]">
                $<span className="font-bold">40</span> / month
              </div>
              <div className="mt-[5px] flex justify-between">
                <div className="text-[7px] text-[#12AD50]  md:text-[8.4px]  lg:text-[10px]  xl:text-[11.2px] 2xl:text-[14px]">
                  ~$13,000 savings
                </div>
                <img
                  src={`/images/header/question.svg`}
                  alt="image"
                  className="mb-[5px] w-[6.5px]  md:w-[7.8px]  lg:w-[9.1px] xl:w-[10.4px] 2xl:w-[13px]"
                />
              </div>
            </div> */}
            <div className="flex items-center gap-x-[15px] font-medium text-[#000] md:gap-x-[18px] lg:gap-x-[21px] xl:gap-x-[24px] 2xl:gap-x-[30px]">
              {headerItens.map((option, index) => (
                <a key={index} href={option.href}>
                  <div className="hover:text-[#313131]">{option.label}</div>
                </a>
              ))}
            </div>
            <div className="grid gap-y-[12px] font-medium  ">
              <div className="flex h-fit cursor-pointer justify-center gap-x-[8px] rounded-[5px] border-[1px] border-[#0354EC] bg-[#fff] py-[6.2px] px-[11px] text-center  text-[#0354EC] hover:text-[#203b6e]   md:py-[7.5px] md:px-[12.5px]    lg:py-[8.75px]  lg:px-[14.5px]  xl:py-[10px] xl:px-[17px]  2xl:gap-x-[10px] 2xl:py-[10px] 2xl:px-[21px]">
                <img
                  src={`${
                    process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                      ? process.env.NEXT_PUBLIC_BASE_PATH
                      : ''
                  }/images/header/new-storm.svg`}
                  alt="image"
                  className={`w-[5px] md:w-[6px] lg:w-[7px] xl:w-[8px] 2xl:w-[10px]`}
                />
                <div
                  onClick={() => {
                    console.log(finalNodes)
                    push(
                      `${
                        process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                          ? `/xnode/start-here`
                          : `/start-here`
                      }`,
                    )
                  }}
                >
                  Create service and deploy
                </div>
              </div>
            </div>

            {user?.sessionToken ? (
              <div>
                <img
                  src={
                    !user.profilePictureHash
                      ? `${
                          process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                            ? process.env.NEXT_PUBLIC_BASE_PATH
                            : ''
                        }/images/header/user-circle.svg`
                      : `https://cloudflare-ipfs.com/ipfs/${user.profilePictureHash}`
                  }
                  alt="image"
                  onClick={() => {
                    setUserNavbarOpen(!userNavbarOpen)
                  }}
                  className={`mr-[15px] h-[50px] w-[50px] cursor-pointer rounded-[100%] 2xl:mr-[15px]`}
                />
                <nav
                  className={`navbar absolute right-[100px] z-50 flex w-[150px] rounded-[8px] border-[.5px] bg-[#e6e4e4] pt-[19px] pr-1 pl-[15px] pb-[30px] text-[13px] text-[#fff] duration-300  ${
                    userNavbarOpen
                      ? 'visibility top-20 opacity-100'
                      : 'invisible top-20 opacity-0'
                  }`}
                >
                  <div className="mt-[10px]">
                    <div className="mt-[25px]">
                      <a
                        onClick={signOutUser}
                        className=" cursor-pointer items-center rounded-[5px] border  border-[#000] bg-transparent py-[6px] px-[18px] text-[12px] font-bold !leading-[19px] text-[#575757] hover:bg-[#ececec]"
                      >
                        Sign out
                      </a>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setUserNavbarOpen(false)
                    }}
                    className="ml-[20px]  flex cursor-pointer justify-end text-[16px] font-bold text-[#000] hover:text-[#313131]"
                  >
                    x
                  </div>
                </nav>
              </div>
            ) : (
              <a
                href={`${
                  process.env.NEXT_PUBLIC_ENVIRONMENT === 'PROD'
                    ? `/xnode/login`
                    : '/login'
                }`}
                className=" my-auto h-fit cursor-pointer items-center   border-b  border-[#000] bg-transparent text-[16px]  font-bold !leading-[19px] text-[#000] hover:text-[#3b3a3a]"
              >
                Login
              </a>
            )}
          </div>

          {/* <div className="lg:hidden">
          <Dialog.Root>
            <Dialog.Trigger>
              <List className="text-black" size={24} weight="bold" />
            </Dialog.Trigger>
            <HeaderModal navigationItems={navigationItems} />
          </Dialog.Root>
        </div> */}
        </div>
      </header>
    </>
  )
}

export default Header
