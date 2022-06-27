import * as React from "react";
import { useEffect } from "react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import { useMoralis } from "react-moralis";
import { ConnectButton } from "web3uikit";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  IconButton,
  Container,
  Menu,
  Tooltip,
  MenuItem,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";

const navigation = [
  { name: "Categories", href: "#" },
  { name: "Location", href: "#" },
];

const categories = ["Politics", "Business", "Sports", "Life", "Culture"];
const locations = [
  "Africa",
  "Asia",
  "Australia",
  "Europe",
  "Latin America",
  "Middle East",
  "US&Canada",
];
const settings = ["Account", "Dashboard", "Logout"];

const Navbar = () => {
  const [myAccount, setMyAccount] = React.useState(null);

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  //   useEffect(() => {
  //     ;(async () => {
  //         const ethereumProvider = (await detectEthereumProvider()) as any
  //         const accounts = await ethereumProvider.request({ method: "eth_accounts" })
  //         const ethersProvider = new providers.Web3Provider(ethereumProvider)

  //         if (accounts[0]) {
  //             setAccount(getAddress(accounts[0]))
  //             setSigner(ethersProvider.getSigner())
  //         }

  //         ethereumProvider.on("accountsChanged", (newAccounts: string[]) => {
  //             if (newAccounts.length !== 0) {
  //                 setAccount(getAddress(newAccounts[0]))
  //                 setSigner(ethersProvider.getSigner())
  //             } else {
  //                 setAccount(undefined)
  //                 setSigner(undefined)
  //             }
  //         })
  //     })()
  // }, [])
  const {
    enableWeb3,
    account,
    isWeb3Enabled,
    isWeb3EnableLoading,
    Moralis,
    deactivateWeb3,
  } = useMoralis();

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install metamask!");
      return;
    }

    await enableWeb3();
    console.log(account);
    setMyAccount(account);

    // try {
    //   const accounts = await ethereum.request({
    //     method: "eth_requestAccounts",
    //   });
    //   console.log("account[0]: ", accounts[0]);
    //   setAccount(accounts[0]);
    // } catch (err) {
    //   console.log(err);
    // }
  };
  // useEffect(() => {}, []);
  useEffect(() => {}, [isWeb3Enabled]);

  useEffect(() => {
    if (isWeb3Enabled) return;
    if (typeof window !== "undefined") {
      if (window.localStorage.getItem("connected")) {
        enableWeb3();
        // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
      }
    }
  }, [isWeb3Enabled]);
  // no array, run on every render
  // empty array, run once
  // dependency array, run when the stuff in it changesan

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null Account found");
      }
    });
  }, []);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [anchorEl2, setAnchorEl2] = React.useState(null);
  const open2 = Boolean(anchorEl2);

  const handleClick2 = (event) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <ArticleIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
            <Link href="/">
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                zkNews
              </Typography>
            </Link>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                <MenuItem>
                  <Typography textAlign="center">xxx</Typography>
                </MenuItem>

                {categories.map((category) => (
                  <MenuItem key={category} onClick={handleCloseNavMenu}>
                    {/* <Link href={`/${page}`}> */}
                    <Typography textAlign="center">{category}</Typography>
                    {/* </Link> */}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <ArticleIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href=""
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              zkNews
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Link href="/news">
                <Button sx={{ my: 2, color: "white", display: "block" }}>
                  News
                </Button>
              </Link>
              <Button
                id="demo-positioned-button"
                aria-controls={open ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Categories
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {categories.map((category) => (
                  <Link
                    key={category}
                    href={`/categories/${category.toLowerCase()}`}
                  >
                    <MenuItem onClick={handleClose}>{category}</MenuItem>
                  </Link>
                ))}
              </Menu>
              <Button
                id="demo-positioned-button"
                aria-controls={open2 ? "demo-positioned-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open2 ? "true" : undefined}
                onClick={handleClick2}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Locations
              </Button>
              <Menu
                id="demo-positioned-menu"
                aria-labelledby="demo-positioned-button"
                anchorEl={anchorEl2}
                open={open2}
                onClose={handleClose2}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                {locations.map((location) => (
                  <Link
                    key={location}
                    href={`/categories/${location.toLowerCase()}`}
                  >
                    <MenuItem onClick={handleClose2}>{location}</MenuItem>
                  </Link>
                ))}
              </Menu>
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  {/* <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" /> */}
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>

              <Link href="/login">
                <Button color="inherit">Registration</Button>
              </Link>

              {/* {account ? (
                <Button color="inherit">
                  {account.slice(2, 6)}...{account.slice(account.length - 4)}
                </Button>
              ) : (
                <Button onClick={connectWallet} color="inherit">
                  Connect Wallet
                  {myAccount}
                </Button>
              )} */}

              <ConnectButton moralisAuth={false} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
