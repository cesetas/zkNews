import * as React from "react";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import ArticleIcon from "@mui/icons-material/Article";

const navigation = [
  { name: "Categories", href: "#" },
  { name: "Location", href: "#" },
];

const pages = ["News", "Articles", "Categories"];
const settings = ["Account", "Dashboard", "Logout"];

const Navbar = () => {
  const [account, setAccount] = React.useState(null);

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

  const connectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Install metamask!");
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("account[0]: ", accounts[0]);
      setAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
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
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    {/* <Link href={`/${page}`}> */}
                    <Typography textAlign="center">{page}</Typography>
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
              {pages.map((page) => (
                <Link key={page} href={`/${page.toLowerCase()}`}>
                  <Button
                    onClick={handleCloseNavMenu}
                    sx={{ my: 2, color: "white", display: "block" }}
                  >
                    {page}
                  </Button>
                </Link>
              ))}
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
              {!account ? (
                <Link href="/Login">
                  <Button color="inherit">Login</Button>
                </Link>
              ) : (
                <Button onMouseDown={(e) => e.preventDefault()} color="inherit">
                  {account}
                </Button>
              )}

              {!account ? (
                <Link href="/Login">
                  <Button onClick={connectWallet} color="inherit">
                    Connect Wallet
                  </Button>
                </Link>
              ) : (
                <Button onMouseDown={(e) => e.preventDefault()} color="inherit">
                  {account}
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
