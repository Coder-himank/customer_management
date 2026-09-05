import Link from "next/link";
import styles from "@/styles/Home.module.css";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
export default function Home() {

    const {data : session} = useSession();  

    useEffect(() => {
        if (session) {
            // Redirect to dashboard if user is logged in
            window.location.href = "/dashboard";
        }
    }, [session]);
    return (
        <div className={styles.page}>

            {/* =================================
                NAVBAR
            ================================= */}

            <header className={styles.navbar}>

                <div className={styles.navInner}>

                    <Link href="/" className={styles.logo}>

                        <div className={styles.logoMark}>
                            C
                        </div>

                        <div className={styles.logoText}>
                            <strong>Customer</strong>
                            <span>Management</span>
                        </div>

                    </Link>


                    <nav className={styles.navLinks}>

                        <a href="#features">
                            Features
                        </a>

                        <a href="#about">
                            About
                        </a>

                        <a href="#benefits">
                            Benefits
                        </a>

                    </nav>


                    <div className={styles.navActions}>

                        <Link
                            href="/authenticate/login"
                            className={styles.login}
                        >
                            Login
                        </Link>

                        <Link
                            href="/authenticate/signup"
                            className={styles.signup}
                        >
                            Get Started
                            <span>↗</span>
                        </Link>

                    </div>

                </div>

            </header>


            {/* =================================
                HERO
            ================================= */}

            <main>

                <section className={styles.hero}>

                    <div className={styles.heroGlow}></div>

                    <div className={styles.heroInner}>

                        {/* LEFT */}

                        <div className={styles.heroContent}>

                            <div className={styles.badge}>
                                <span className={styles.badgeDot}></span>

                                SMART CUSTOMER MANAGEMENT

                            </div>


                            <h1>

                                Know your
                                <span> customers.</span>

                                <br />

                                Grow your
                                <span> business.</span>

                            </h1>


                            <p className={styles.heroDescription}>

                                A simple and powerful customer management
                                system designed for businesses that want to
                                keep track of customers, products purchased,
                                gifts given and valuable customer insights.

                            </p>


                            <div className={styles.heroButtons}>

                                <Link
                                    href="/authenticate/signup"
                                    className={styles.primaryButton}
                                >
                                    Start Managing Customers
                                    <span>→</span>
                                </Link>

                                <a
                                    href="#features"
                                    className={styles.secondaryButton}
                                >
                                    Explore Features
                                </a>

                            </div>


                            <div className={styles.trustRow}>

                                <div className={styles.avatarStack}>

                                    <span>R</span>
                                    <span>A</span>
                                    <span>M</span>
                                    <span>+</span>

                                </div>

                                <div>

                                    <strong>
                                        Built for everyday business
                                    </strong>

                                    <small>
                                        Simple • Fast • Organized
                                    </small>

                                </div>

                            </div>

                        </div>


                        {/* RIGHT VISUAL */}

                        <div className={styles.heroVisual}>

                            <div className={styles.imageGlow}></div>

                            <div className={styles.dashboardImage}>

                                <img
                                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85"
                                    alt="Business team managing customers"
                                />

                            </div>


                            {/* FLOATING CUSTOMER CARD */}

                            <div className={styles.customerFloat}>

                                <div className={styles.floatAvatar}>
                                    RK
                                </div>

                                <div className={styles.floatInfo}>

                                    <strong>
                                        Rajesh Kumar
                                    </strong>

                                    <span>
                                        Top Customer
                                    </span>

                                </div>

                                <div className={styles.floatScore}>
                                    #01
                                </div>

                            </div>


                            {/* FLOATING PURCHASE CARD */}

                            <div className={styles.purchaseFloat}>

                                <span>
                                    Customer purchases
                                </span>

                                <strong>
                                    1,248
                                </strong>

                                <small>
                                    Products recorded
                                </small>

                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    INTRO
                ================================= */}

                <section
                    id="about"
                    className={styles.intro}
                >

                    <div className={styles.sectionLabel}>
                        ONE PLACE. EVERYTHING ORGANIZED.
                    </div>

                    <h2>
                        Your customers are more than
                        <span> names and numbers.</span>
                    </h2>

                    <p>

                        Keep a complete picture of every customer.
                        Know what they purchase, understand their
                        preferences and remember the gifts you have
                        given them — all from one beautifully organized
                        dashboard.

                    </p>

                </section>


                {/* =================================
                    FEATURES
                ================================= */}

                <section
                    id="features"
                    className={styles.features}
                >

                    <div className={styles.sectionHeading}>

                        <div>

                            <span>
                                POWERFUL & SIMPLE
                            </span>

                            <h2>
                                Everything you need
                            </h2>

                        </div>

                        <p>
                            Designed around the way real businesses
                            manage customer relationships.
                        </p>

                    </div>


                    <div className={styles.featureGrid}>

                        <Feature
                            number="01"
                            icon="◉"
                            title="Customer Profiles"
                            text="Keep customer information, phone numbers, addresses and profile images organized in one place."
                        />

                        <Feature
                            number="02"
                            icon="▣"
                            title="Purchase Tracking"
                            text="Record exactly what every customer purchases, whether it is bags, tons or individual pieces."
                        />

                        <Feature
                            number="03"
                            icon="✦"
                            title="Gift History"
                            text="Never forget what you have given a customer. Maintain gift records and images for every customer."
                        />

                        <Feature
                            number="04"
                            icon="↗"
                            title="Customer Insights"
                            text="Compare customers and identify your most valuable and active customers."
                        />

                    </div>

                </section>


                {/* =================================
                    VISUAL SECTION
                ================================= */}

                <section
                    id="benefits"
                    className={styles.visualSection}
                >

                    <div className={styles.visualImage}>

                        <img
                            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85"
                            alt="Business discussion"
                        />

                        <div className={styles.imageTag}>
                            <span></span>
                            Customer-first business
                        </div>

                    </div>


                    <div className={styles.visualContent}>

                        <span className={styles.sectionLabel}>
                            BUILT FOR YOUR BUSINESS
                        </span>

                        <h2>
                            Turn customer data into
                            <span> better relationships.</span>
                        </h2>

                        <p>
                            When customer information is organized,
                            your business becomes easier to manage.
                            Quickly understand who your customers are,
                            what they buy and how valuable they are.
                        </p>


                        <div className={styles.checkList}>

                            <div>
                                <span>✓</span>
                                No complicated spreadsheets
                            </div>

                            <div>
                                <span>✓</span>
                                Quick customer lookup
                            </div>

                            <div>
                                <span>✓</span>
                                Product purchase history
                            </div>

                            <div>
                                <span>✓</span>
                                Gift tracking with images
                            </div>

                        </div>

                    </div>

                </section>


                {/* =================================
                    STATS
                ================================= */}

                <section className={styles.stats}>

                    <Stat
                        value="100%"
                        label="Customer focused"
                    />

                    <Stat
                        value="24/7"
                        label="Data availability"
                    />

                    <Stat
                        value="01"
                        label="Unified dashboard"
                    />

                    <Stat
                        value="∞"
                        label="Customers you can manage"
                    />

                </section>


                {/* =================================
                    CTA
                ================================= */}

                <section className={styles.cta}>

                    <div className={styles.ctaGlow}></div>

                    <div className={styles.ctaContent}>

                        <span>
                            READY TO GET ORGANIZED?
                        </span>

                        <h2>
                            Start knowing your
                            <br />
                            customers better.
                        </h2>

                        <p>
                            Create your account and start building
                            your customer database today.
                        </p>


                        <div className={styles.ctaButtons}>

                            <Link
                                href="/authenticate/signup"
                                className={styles.ctaPrimary}
                            >
                                Create Free Account
                                <span>→</span>
                            </Link>

                            <Link
                                href="/authenticate/login"
                                className={styles.ctaLogin}
                            >
                                Already have an account?
                                <strong> Login</strong>
                            </Link>

                        </div>

                    </div>

                </section>

            </main>


            {/* =================================
                FOOTER
            ================================= */}

            <footer className={styles.footer}>

                <div className={styles.footerInner}>

                    <div className={styles.logo}>

                        <div className={styles.logoMark}>
                            C
                        </div>

                        <div className={styles.logoText}>
                            <strong>Customer</strong>
                            <span>Management</span>
                        </div>

                    </div>


                    <p>
                        Simple customer management
                        for growing businesses.
                    </p>


                    <div className={styles.footerLinks}>

                        <Link href="/authenticate/login">
                            Login
                        </Link>

                        <Link href="/authenticate/signup">
                            Sign Up
                        </Link>

                        <a href="#features">
                            Features
                        </a>

                    </div>

                </div>

                <div className={styles.copyright}>
                    © {new Date().getFullYear()} Customer Management.
                    All rights reserved.
                </div>

            </footer>

        </div>
    );
}


/* =================================
   FEATURE COMPONENT
================================= */

function Feature({
    number,
    icon,
    title,
    text
}) {

    return (

        <div className={styles.featureCard}>

            <div className={styles.featureTop}>

                <span>
                    {number}
                </span>

                <div className={styles.featureIcon}>
                    {icon}
                </div>

            </div>

            <h3>
                {title}
            </h3>

            <p>
                {text}
            </p>

            <div className={styles.featureArrow}>
                ↗
            </div>

        </div>

    );
}


/* =================================
   STAT COMPONENT
================================= */

function Stat({
    value,
    label
}) {

    return (

        <div className={styles.stat}>

            <strong>
                {value}
            </strong>

            <span>
                {label}
            </span>

        </div>

    );
}