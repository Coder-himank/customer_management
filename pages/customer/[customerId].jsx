
import styles from "@/styles/customerDashboard.module.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import Link from "next/link";

const CustomerDashboard = () => {

    const [customer, setCustomer] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [gifts, setGifts] = useState([]);

    const router = useRouter();

    useEffect(() => {

        if (!router.isReady) return;

        const customerId = router.query.customerId;

        const fetchCustomerData = async () => {



            try {

                setLoading(true);

                const response = await axios.get(
                    `/api/customers/${customerId}`
                );

                const data = response.data.data;

                setCustomer(data.customer);
                setAnalytics(data.analytics);
                setProducts(data.products || []);
                setOrders(data.orders || []);
                setTargets(data.targets || []);
                setGifts(data.gifts || []);
            } catch (error) {

                console.error(
                    "Failed to fetch customer:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        fetchCustomerData();

    }, [router.isReady, router.query.customerId]);


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <div className={styles.loading}>
                Loading customer...
            </div>
        );
    }


    /* =========================
       CUSTOMER NOT FOUND
    ========================= */

    if (!customer) {
        return (
            <div className={styles.empty}>
                Customer not found.
            </div>
        );
    }


    /* =========================
       DATA
    ========================= */

    const address =
        customer.addresses?.find(
            (address) => address.isDefault
        ) ||
        customer.addresses?.[0];


    const lifetime =
        analytics?.lifetime || {};


    const ranking =
        analytics?.ranking || {};


    const currentYear =
        analytics?.currentYear || {};


    /* =========================
       FORMATTERS
    ========================= */

    const formatCurrency = (value = 0) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value);

    };


    const formatNumber = (value = 0) => {

        return new Intl.NumberFormat(
            "en-IN"
        ).format(value);

    };


    const formatDate = (date) => {

        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    };


    /* =========================
       SEGMENT
    ========================= */

    const segment =
        customer.segment
            ?.replace("_", " ")
            ?.toUpperCase() ||
        "NEW";


    /* =========================
       RANK
    ========================= */

    const rank =
        ranking.overall || ranking.purchaseAmount || "—";


    const totalCustomers =
        ranking.totalCustomers || 0;


    const percentile =
        ranking.percentile || 0;


    /* =========================
       RENDER
    ========================= */

    return (

        <>

            {/* =========================
                PROFILE
            ========================= */}

            <div className={styles.profile}>

                <div className={styles.avatar}>

                    <img
                        src={
                            customer.image ||
                            "/images/default-user.png"
                        }
                        alt={customer.name}
                    />

                </div>


                <div className={styles.profileInfo}>

                    <h1>
                        {customer.name}
                    </h1>

                    <p>

                        {customer.phone}

                        {" · "}

                        {address?.city || "No city"}

                        {address?.state &&
                            `, ${address.state} `
                        }

                    </p>

                    {customer.companyName && (
                        <small>
                            {customer.companyName}
                        </small>
                    )}

                </div>


                <div
                    className={`${styles.customerBadge} ${styles[
                        customer.segment
                    ] || ""
                        } `}
                >
                    {segment}
                </div>

            </div>


            {/* =========================
                MAIN STATS
            ========================= */}

            <div className={styles.stats}>


                {/* ORDERS */}

                <div className={styles.statCard}>

                    <span>
                        Total Orders
                    </span>

                    <strong>
                        {formatNumber(
                            lifetime.totalOrders
                        )}
                    </strong>

                    <small>
                        All time
                    </small>

                </div>


                {/* PRODUCTS */}

                <div className={styles.statCard}>

                    <span>
                        Total Products
                    </span>

                    <strong>
                        {formatNumber(
                            (
                                lifetime.cementBags || 0
                            ) +
                            (
                                lifetime.ironRodTons || 0
                            ) +
                            (
                                lifetime.ironSheetPieces || 0
                            )
                        )}
                    </strong>

                    <small>
                        Units purchased
                    </small>

                </div>


                {/* MONEY */}

                <div className={styles.statCard}>

                    <span>
                        Total Spent
                    </span>

                    <strong>
                        {formatCurrency(
                            lifetime.totalAmount
                        )}
                    </strong>

                    <small>
                        Lifetime value
                    </small>

                </div>


                {/* RANK */}

                <div className={styles.statCard}>

                    <span>
                        Customer Rank
                    </span>

                    <strong>
                        #{rank}
                    </strong>

                    <small>
                        Among all customers
                    </small>

                </div>

            </div>


            {/* =========================
                PURCHASE PERFORMANCE
            ========================= */}

            <div className={styles.comparison}>

                <div
                    className={
                        styles.comparisonHeader
                    }
                >

                    <div>

                        <span>
                            Purchase Performance
                        </span>

                        <h2>

                            {percentile ? <p> Top {Math.max(1, 100 - percentile).toFixed(1)}% of customers </p> : "Customer performance"}

                        </h2>

                    </div>


                    <div className={styles.rank}>

                        #{rank}

                        {totalCustomers > 0 && (
                            <small>
                                / {totalCustomers}
                            </small>
                        )}

                    </div>

                </div>


                <div className={styles.progress}>

                    <div
                        className={
                            styles.progressFill
                        }
                        style={{ width: Math.min(100, percentile) + "%" }}
                    />

                </div>


                <div
                    className={
                        styles.comparisonValues
                    }
                >

                    <div>

                        <span>
                            Average customer
                        </span>

                        <strong>

                            {formatCurrency(
                                analytics?.averageCustomerAmount ||
                                0
                            )}

                        </strong>

                    </div>


                    <div>

                        <span>
                            This customer
                        </span>

                        <strong>

                            {formatCurrency(
                                lifetime.totalAmount
                            )}

                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================
                CURRENT YEAR
            ========================= */}

            <div className={styles.productSection}>

                <div className={styles.sectionHeader}>

                    <div>

                        <span>
                            {currentYear.year || new Date().getFullYear()}
                        </span>

                        <h2>
                            Purchase Overview
                        </h2>

                    </div>

                </div>


                <div className={styles.stats}>

                    <div className={styles.statCard}>

                        <span>
                            Cement
                        </span>

                        <strong>
                            {formatNumber(
                                currentYear.cementBags
                            )}
                        </strong>

                        <small>
                            Bags
                        </small>

                    </div>


                    <div className={styles.statCard}>

                        <span>
                            Iron Rod
                        </span>

                        <strong>
                            {formatNumber(
                                currentYear.ironRodTons
                            )}
                        </strong>

                        <small>
                            Tons
                        </small>

                    </div>


                    <div className={styles.statCard}>

                        <span>
                            Iron Sheet
                        </span>

                        <strong>
                            {formatNumber(
                                currentYear.ironSheetPieces
                            )}
                        </strong>

                        <small>
                            Pieces
                        </small>

                    </div>


                    <div className={styles.statCard}>

                        <span>
                            Purchase Value
                        </span>

                        <strong>
                            {formatCurrency(
                                currentYear.totalAmount
                            )}
                        </strong>

                        <small>
                            This year
                        </small>

                    </div>

                </div>

            </div>


            {/* =========================
                PRODUCTS
            ========================= */}

            <div className={styles.productSection}>

                <div className={styles.sectionHeader}>

                    <div>

                        <span>
                            Purchase Analysis
                        </span>

                        <h2>
                            Products Purchased
                        </h2>

                    </div>

                </div>


                {products.length === 0 ? (

                    <p>
                        No purchase data available.
                    </p>

                ) : (

                    products.map((product) => (

                        <div
                            className={
                                styles.productRow
                            }
                            key={
                                product.productName ||
                                product._id
                            }
                        >

                            <div
                                className={
                                    styles.productName
                                }
                            >

                                <strong>
                                    {product.productName}
                                </strong>

                                <span>
                                    {formatNumber(
                                        product.orders
                                    )}{" "}
                                    orders
                                </span>

                            </div>


                            <div
                                className={
                                    styles.productBar
                                }
                            >

                                <div
                                    style={{
                                        width: Math.min(100, product.percentage || 0) + "%"
                                    }}
                                />

                            </div>


                            <strong
                                className={
                                    styles.quantity
                                }
                            >

                                {formatNumber(
                                    product.quantity
                                )}{" "}

                                {product.unit}

                            </strong>

                        </div>

                    ))

                )}

            </div>


            {/* =========================
                TARGETS
            ========================= */}

            {targets.length > 0 && (

                <div className={styles.history}>

                    <h2>
                        Active Targets
                    </h2>


                    {targets.map((target) => {

                        const progress =
                            target.progress || 0;

                        return (

                            <div
                                className={
                                    styles.orderRow
                                }
                                key={target._id}
                            >

                                <div>

                                    <strong>
                                        {target.name}
                                    </strong>

                                    <span>

                                        {formatNumber(
                                            target.currentQuantity
                                        )}{" "}

                                        /{" "}

                                        {formatNumber(
                                            target.targetQuantity
                                        )}{" "}

                                        {target.unit}

                                    </span>

                                </div>


                                <div
                                    className={
                                        styles.productBar
                                    }
                                >

                                    <div
                                        style={{
                                            width: Math.min(
                                                100,
                                                progress
                                            ) + '%',
                                        }}
                                    />

                                </div>


                                <strong>

                                    {progress.toFixed(0)}%

                                </strong>

                            </div>

                        );

                    })}

                </div>

            )}





            {/* =========================
                GIFTS HISTORY
            ========================= */}

            <div className={styles.history}>

                <h2>
                    GIFT History
                </h2>


                {gifts.length === 0 ? (

                    <p>
                        No gift history.
                    </p>

                ) : (

                    gifts.map((gift) => (

                        <Link
                            className={
                                styles.orderRow
                            }

                            href={`/dashboard/gifts/${gift._id}`}
                            key={gift._id}
                        >

                            <div>

                                <strong>
                                    {gift.name}
                                </strong>

                                <span>
                                    {formatDate(
                                        gift.givenDate
                                    )}
                                </span>

                            </div>



                            <span>

                                {formatNumber(
                                    gift.quantity
                                )}{" "}

                            </span>


                            <strong>

                                {formatCurrency(
                                    gift.estimatedValue
                                )}

                            </strong>

                        </Link>

                    ))

                )}

            </div>
            {/* =========================
                PURCHASE HISTORY
            ========================= */}

            <div className={styles.history}>

                <h2>
                    Purchase History
                </h2>


                {orders.length === 0 ? (

                    <p>
                        No purchase history.
                    </p>

                ) : (

                    orders.map((order) => (

                        <Link
                            href={`/dashboard/purchases/${order._id}`}
                            className={
                                styles.orderRow
                            }
                            key={order._id}
                        >

                            <div>

                                <strong>
                                    {order.productName}
                                </strong>

                                <span>
                                    {formatDate(
                                        order.date
                                    )}
                                </span>

                            </div>


                            <span>

                                {formatNumber(
                                    order.quantity
                                )}{" "}

                                {order.unit}

                            </span>


                            <strong>

                                {formatCurrency(
                                    order.totalAmount
                                )}

                            </strong>

                        </Link>

                    ))

                )}

            </div>

        </>

    );
};

export default CustomerDashboard;
