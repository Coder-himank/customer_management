import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/header.module.css";

export default function Header() {

    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header className={styles.header}>

            <div className={styles.headerInner}>

                {/* Logo */}

                <Link
                    href="/"
                    className={styles.logo}
                    onClick={closeMenu}
                >
                    <div className={styles.logoMark}>
                        C
                    </div>

                    <div className={styles.logoText}>
                        <strong>Customer</strong>
                        <span>Management</span>
                    </div>
                </Link>


                {/* Desktop Navigation */}

                <nav className={styles.nav}>

                    <Link href="/dashboard">
                        Dashboard
                    </Link>

                    <Link href="/customer/details">
                        Add Customer
                    </Link>

                    <Link
                        href="/dashboard/purchases"
                        onClick={closeMenu}
                    >
                        Purchases
                    </Link>

                    <Link href="/dashboard/gifts">
                        Gifts
                    </Link>
                    <Link href="/dashboard/targets">
                        Targets
                    </Link>

                </nav>


                {/* Mobile Menu Button */}

                <button
                    className={`${styles.menuButton} ${menuOpen ? styles.active : ""
                        }`}
                    onClick={() =>
                        setMenuOpen(!menuOpen)
                    }
                    aria-label="Toggle navigation"
                >

                    <span></span>
                    <span></span>
                    <span></span>

                </button>


                {/* Mobile Navigation */}

                <div
                    className={`${styles.mobileMenu} ${menuOpen
                        ? styles.mobileMenuOpen
                        : ""
                        }`}
                >

                    <Link
                        href="/dashboard"
                        onClick={closeMenu}
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/customer/details"
                        onClick={closeMenu}
                    >
                        Add Customer
                    </Link>

                    <Link
                        href="/dashboard/purchases"
                        onClick={closeMenu}
                    >
                        Purchases
                    </Link>
                    <Link
                        href="/dashboard/gifts"
                        onClick={closeMenu}
                    >
                        Gifts
                    </Link>
                    <Link
                        href="/dashboard/targets"
                        onClick={closeMenu}
                    >
                        Targets
                    </Link>

                </div>

            </div>

        </header>
    );
}