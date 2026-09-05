import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import styles from "@/styles/targetManagement.module.css";

export default function TargetsPage() {
    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {
        try {
            setLoading(true);

            const { data } = await axios.get("/api/targets");

            setTargets(data.targets || []);
        } catch (error) {
            console.error("Failed to fetch targets", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTargets = targets.filter((target) => {
        if (filter === "all") return true;
        return target.status === filter;
    });

    const activeTargets = targets.filter(
        (target) => target.status === "active"
    ).length;

    const completedTargets = targets.filter(
        (target) => target.status === "completed"
    ).length;

    const totalParticipants = targets.reduce(
        (sum, target) => sum + (target.participants || 0),
        0
    );

    const totalGifts = targets.reduce(
        (sum, target) => sum + (target.giftsGiven || 0),
        0
    );

    const totalSales = targets.reduce(
        (sum, target) => sum + (target.salesGenerated || 0),
        0
    );

    const formatMoney = (value) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getProgress = (target) => {
        if (!target.targetQuantity) return 0;

        return Math.min(
            100,
            Math.round(
                ((target.totalPurchased || 0) /
                    target.targetQuantity) *
                100
            )
        );
    };

    return (
        <div className={styles.page}>

            {/* HEADER */}
            <div className={styles.header}>
                <div>
                    <div className={styles.eyebrow}>
                        TRADEINTEL / TARGET MANAGEMENT
                    </div>

                    <h1>Targets & Schemes</h1>

                    <p>
                        Monitor sales campaigns, customer progress,
                        achievements and gifts from one place.
                    </p>
                </div>

                <Link href="/dashboard/targets/create">
                    <button className={styles.createButton}>
                        + Create Target
                    </button>
                </Link>
            </div>

            {/* KPI CARDS */}
            <div className={styles.kpiGrid}>

                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>
                        ACTIVE TARGETS
                    </span>

                    <strong>{activeTargets}</strong>

                    <small>
                        Currently running
                    </small>
                </div>

                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>
                        PARTICIPANTS
                    </span>

                    <strong>{totalParticipants}</strong>

                    <small>
                        Across all campaigns
                    </small>
                </div>

                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>
                        COMPLETED
                    </span>

                    <strong>{completedTargets}</strong>

                    <small>
                        Successful targets
                    </small>
                </div>

                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>
                        GIFTS GIVEN
                    </span>

                    <strong>{totalGifts}</strong>

                    <small>
                        Dynamically from gifts
                    </small>
                </div>

                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>
                        SALES GENERATED
                    </span>

                    <strong>
                        {formatMoney(totalSales)}
                    </strong>

                    <small>
                        Campaign sales
                    </small>
                </div>

            </div>

            {/* FILTER */}
            <div className={styles.toolbar}>

                <div>
                    <h2>Campaigns</h2>

                    <span>
                        {filteredTargets.length} targets
                    </span>
                </div>

                <div className={styles.filters}>

                    {[
                        ["all", "All"],
                        ["active", "Active"],
                        ["completed", "Completed"],
                        ["draft", "Draft"],
                        ["expired", "Expired"],
                    ].map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={
                                filter === value
                                    ? styles.activeFilter
                                    : ""
                            }
                        >
                            {label}
                        </button>
                    ))}

                </div>
            </div>

            {/* TARGETS */}
            {loading ? (
                <div className={styles.loading}>
                    Loading targets...
                </div>
            ) : filteredTargets.length === 0 ? (
                <div className={styles.empty}>
                    <div>🎯</div>

                    <h3>No targets found</h3>

                    <p>
                        Create your first sales target to start
                        tracking customer performance.
                    </p>
                </div>
            ) : (
                <div className={styles.targetGrid}>

                    {filteredTargets.map((target) => {

                        const progress =
                            getProgress(target);

                        return (
                            <Link
                                href={`/dashboard/targets/${target._id}`}
                                key={target._id}
                                className={styles.targetCard}
                            >

                                <div className={styles.cardTop}>

                                    <div>
                                        <span
                                            className={`${styles.status} ${styles[target.status]}`}
                                        >
                                            {target.status}
                                        </span>

                                        <h3>
                                            {target.name}
                                        </h3>
                                    </div>

                                    <span className={styles.arrow}>
                                        →
                                    </span>

                                </div>

                                <div className={styles.productInfo}>

                                    <span>
                                        {target.productName ||
                                            target.category}
                                    </span>

                                    <span>
                                        {target.targetQuantity}{" "}
                                        {target.unit}
                                    </span>

                                </div>

                                <div className={styles.dates}>
                                    {formatDate(target.startDate)}
                                    <span>→</span>
                                    {formatDate(target.endDate)}
                                </div>

                                <div className={styles.progressHeader}>

                                    <span>
                                        Overall Progress
                                    </span>

                                    <strong>
                                        {progress}%
                                    </strong>

                                </div>

                                <div className={styles.progressBar}>
                                    <div
                                        style={{
                                            width: `${progress}%`,
                                        }}
                                    />
                                </div>

                                <div className={styles.stats}>

                                    <div>
                                        <strong>
                                            {target.participants || 0}
                                        </strong>
                                        <span>
                                            Participants
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            {target.completed || 0}
                                        </strong>
                                        <span>
                                            Completed
                                        </span>
                                    </div>

                                    <div>
                                        <strong>
                                            {target.giftsGiven || 0}
                                        </strong>
                                        <span>
                                            Gifts
                                        </span>
                                    </div>

                                </div>

                                <div className={styles.sales}>

                                    <span>
                                        Sales Generated
                                    </span>

                                    <strong>
                                        {formatMoney(
                                            target.salesGenerated
                                        )}
                                    </strong>

                                </div>

                            </Link>
                        );
                    })}

                </div>
            )}

        </div>
    );
}