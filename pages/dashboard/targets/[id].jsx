import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

import styles from "@/styles/targetDetail.module.css";

export default function TargetDetails() {

    const router = useRouter();

    const { id } = router.query;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!id) return;

        fetchTarget();

    }, [id]);

    const fetchTarget = async () => {

        try {

            setLoading(true);

            const response =
                await axios.get(`/api/targets/${id}`);

            setData(response.data);

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    const money = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);

    const date = (value) =>
        new Date(value).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

    if (loading) {

        return (
            <div className={styles.loading}>
                Loading campaign...
            </div>
        );
    }

    if (!data?.target) {

        return (
            <div className={styles.loading}>
                Target not found.
            </div>
        );
    }

    const {
        target,
        customers = [],
        gifts = [],
    } = data;

    const completed =
        customers.filter(
            (customer) =>
                customer.progress >= 100
        ).length;

    const onTrack =
        customers.filter(
            (customer) =>
                customer.progress >= 50 &&
                customer.progress < 100
        ).length;

    const atRisk =
        customers.filter(
            (customer) =>
                customer.progress < 50
        ).length;

    const totalSales =
        customers.reduce(
            (sum, customer) =>
                sum + customer.sales,
            0
        );

    const totalPurchased =
        customers.reduce(
            (sum, customer) =>
                sum + customer.purchased,
            0
        );

    const overallProgress =
        target.targetQuantity
            ? Math.min(
                100,
                Math.round(
                    (totalPurchased /
                        (customers.length *
                            target.targetQuantity)) *
                    100
                )
            )
            : 0;

    return (

        <div className={styles.page}>

            {/* BACK */}

            <Link
                href="/targets"
                className={styles.back}
            >
                ← Back to Targets
            </Link>

            {/* HERO */}

            <div className={styles.hero}>

                <div>

                    <span
                        className={`${styles.status} ${styles[target.status]}`}
                    >
                        {target.status}
                    </span>

                    <h1>
                        {target.name}
                    </h1>

                    <p>
                        {target.productName ||
                            target.category}
                        {" · "}
                        {target.targetQuantity}
                        {" "}
                        {target.unit}
                    </p>

                </div>

                <div className={styles.heroDate}>

                    <strong>
                        {date(target.startDate)}
                    </strong>

                    <span>→</span>

                    <strong>
                        {date(target.endDate)}
                    </strong>

                </div>

            </div>

            {/* KPI */}

            <div className={styles.kpiGrid}>

                <div className={styles.kpi}>
                    <span>PARTICIPANTS</span>
                    <strong>
                        {customers.length}
                    </strong>
                </div>

                <div className={styles.kpi}>
                    <span>COMPLETED</span>
                    <strong>
                        {completed}
                    </strong>
                </div>

                <div className={styles.kpi}>
                    <span>ON TRACK</span>
                    <strong>
                        {onTrack}
                    </strong>
                </div>

                <div className={styles.kpi}>
                    <span>AT RISK</span>
                    <strong>
                        {atRisk}
                    </strong>
                </div>

                <div className={styles.kpi}>
                    <span>SALES GENERATED</span>
                    <strong>
                        {money(totalSales)}
                    </strong>
                </div>

            </div>

            {/* PERFORMANCE */}

            <div className={styles.performance}>

                <div>

                    <div className={styles.sectionHeader}>

                        <div>
                            <span>
                                CAMPAIGN PERFORMANCE
                            </span>

                            <h2>
                                Overall Achievement
                            </h2>
                        </div>

                        <strong>
                            {overallProgress}%
                        </strong>

                    </div>

                    <div className={styles.bigProgress}>

                        <div
                            style={{
                                width:
                                    `${overallProgress}%`,
                            }}
                        />

                    </div>

                    <div className={styles.performanceStats}>

                        <div>
                            <strong>
                                {totalPurchased}
                            </strong>

                            <span>
                                Total Purchased
                            </span>
                        </div>

                        <div>
                            <strong>
                                {target.targetQuantity}
                            </strong>

                            <span>
                                Target / Customer
                            </span>
                        </div>

                        <div>
                            <strong>
                                {money(totalSales)}
                            </strong>

                            <span>
                                Sales Generated
                            </span>
                        </div>

                    </div>

                </div>

            </div>

            {/* CUSTOMER TABLE */}

            <div className={styles.section}>

                <div className={styles.sectionHeader}>

                    <div>
                        <span>
                            CUSTOMER PERFORMANCE
                        </span>

                        <h2>
                            Target Progress
                        </h2>
                    </div>

                    <span>
                        {customers.length} customers
                    </span>

                </div>

                <div className={styles.tableWrapper}>

                    <table>

                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Purchased</th>
                                <th>Target</th>
                                <th>Progress</th>
                                <th>Sales</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>

                            {customers.map(
                                (customer) => {

                                    const progress =
                                        Math.min(
                                            100,
                                            Math.round(
                                                (customer.purchased /
                                                    target.targetQuantity) *
                                                100
                                            )
                                        );

                                    return (
                                        <tr
                                            key={
                                                customer._id
                                            }
                                        >

                                            <td>

                                                <Link
                                                    href={`/customer/${customer._id}`}
                                                >
                                                    <strong>
                                                        {
                                                            customer.name
                                                        }
                                                    </strong>
                                                </Link>

                                                <span>
                                                    {
                                                        customer.phone
                                                    }
                                                </span>

                                            </td>

                                            <td>
                                                {customer.purchased}
                                                {" "}
                                                {target.unit}
                                            </td>

                                            <td>
                                                {
                                                    target.targetQuantity
                                                }
                                            </td>

                                            <td>

                                                <div
                                                    className={
                                                        styles.progressCell
                                                    }
                                                >

                                                    <div
                                                        className={
                                                            styles.miniProgress
                                                        }
                                                    >
                                                        <div
                                                            style={{
                                                                width:
                                                                    `${progress}%`,
                                                            }}
                                                        />
                                                    </div>

                                                    <span>
                                                        {progress}%
                                                    </span>

                                                </div>

                                            </td>

                                            <td>
                                                {money(
                                                    customer.sales
                                                )}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        styles.customerStatus
                                                    }
                                                >
                                                    {
                                                        progress >= 100
                                                            ? "Completed"
                                                            : progress >= 50
                                                                ? "On Track"
                                                                : "At Risk"
                                                    }
                                                </span>

                                            </td>

                                        </tr>
                                    );
                                }
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

            {/* GIFTS */}

            <div className={styles.section}>

                <div className={styles.sectionHeader}>

                    <div>
                        <span>
                            REWARDS / GIFTS
                        </span>

                        <h2>
                            Gifts Given
                        </h2>
                    </div>

                    <strong>
                        {gifts.length}
                    </strong>

                </div>

                {gifts.length === 0 ? (

                    <div className={styles.noGifts}>
                        No gifts have been recorded
                        for this campaign yet.
                    </div>

                ) : (

                    <div className={styles.giftGrid}>

                        {gifts.map((gift) => (

                            <div
                                className={styles.giftCard}
                                key={gift._id}
                            >

                                <div className={styles.giftIcon}>
                                    🎁
                                </div>

                                <div>

                                    <strong>
                                        {gift.name}
                                    </strong>

                                    <span>
                                        {gift.customerId?.name ||
                                            "Customer"}
                                    </span>

                                    <small>
                                        {date(
                                            gift.givenDate
                                        )}
                                    </small>

                                </div>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}