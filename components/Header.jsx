// components/Header.server.jsx
import HeaderClient from "./HeaderClient";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  let isAdmin = false;

  try {
    const user = await checkUser();
    isAdmin = user?.role === "ADMIN";
  } catch (err) {
    console.error("Failed to fetch user in Header:", err);
  }

  return <HeaderClient isAdminPage={isAdminPage} isAdmin={isAdmin} />;
};

export default Header;
