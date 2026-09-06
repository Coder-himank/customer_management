
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "@/styles/giftDetail.module.css";

export default function GiftDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [gift, setGift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchGift = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/gifts/${id}`
                );

                // Supports both:
                // { gift: {...} }
                // and direct {...}
                const data =
                    response.data?.gift ||
                    response.data?.data ||
                    response.data;

                setGift(data);

            } catch (err) {
                console.error("Failed to fetch gift:", err);

                setError(
                    err.response?.data?.error ||
                    "Unable to load gift details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGift();
    }, [id]);

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }
        );
    };

    const formatDateTime = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const formatOccasion = (occasion) => {
        if (!occasion) return "Customer Reward";

        return occasion
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    const formatTargetType = (type) => {
        if (!type) return "—";

        return type
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };

    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading gift details...</p>
                </div>
            </main>
        );
    }

    if (error || !gift) {
        return (
            <main className={styles.page}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>
                        !
                    </div>

                    <h2>Gift Not Found</h2>

                    <p>
                        {error ||
                            "The requested gift could not be found."}
                    </p>

                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() =>
                            router.push("/dashboard/gifts")
                        }
                    >
                        ← Back to Gifts
                    </button>
                </div>
            </main>
        );
    }

    const customer = gift.customerId;
    const target = gift.targetId;

    return (
        <main className={styles.page}>

            {/* =========================
                HEADER
            ========================= */}

            <header className={styles.header}>

                <button
                    type="button"
                    className={styles.back}
                    onClick={() =>
                        router.push("/dashboard/gifts")
                    }
                >
                    ← Back
                </button>

                <div className={styles.headerContent}>

                    <div>
                        <span className={styles.eyebrow}>
                            GIFT MANAGEMENT
                        </span>

                        <h1>Gift Details</h1>

                        <p>
                            View complete information
                            about this gift.
                        </p>
                    </div>

                    <div className={styles.headerIcon}>
                        🎁
                    </div>

                </div>
            </header>


            {/* =========================
                MAIN CONTENT
            ========================= */}

            <div className={styles.container}>

                {/* =========================
                    GIFT HERO
                ========================= */}

                <section className={styles.heroCard}>

                    <div className={styles.photoWrapper}>

                        {gift.receiverPhoto ? (
                            <img
                                src={gift.receiverPhoto}
                                alt={gift.name}
                                className={styles.receiverPhoto}
                            />
                        ) : (
                            <div className={styles.noPhoto}>
                                🎁
                            </div>
                        )}

                    </div>


                    <div className={styles.heroInfo}>

                        <div className={styles.badge}>
                            {formatOccasion(
                                gift.occasion
                            )}
                        </div>

                        <h2>{gift.name}</h2>

                        <p className={styles.heroDate}>
                            <span>Given on{" "}</span>
                            <strong>
                                {formatDate(
                                    gift.givenDate
                                )}
                            </strong>
                        </p>

                        <div className={styles.heroStats}>

                            <div className={styles.stat}>
                                <span>Quantity</span>
                                <strong>
                                    {gift.quantity}
                                </strong>
                            </div>

                            <div className={styles.statDivider}></div>

                            <div className={styles.stat}>
                                <span>Value</span>
                                <strong>
                                    ₹
                                    {Number(
                                        gift.estimatedValue || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>
                            </div>

                        </div>

                    </div>

                </section>


                <div className={styles.grid}>


                    {/* =========================
                        CUSTOMER
                    ========================= */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                👤
                            </div>

                            <div>
                                <h3>Customer</h3>
                                <p>
                                    Gift recipient information
                                </p>
                            </div>

                        </div>


                        <div className={styles.infoList}>

                            <InfoRow
                                label="Name"
                                value={
                                    customer?.name ||
                                    "—"
                                }
                            />

                            <InfoRow
                                label="Phone"
                                value={
                                    customer?.phone ||
                                    "—"
                                }
                            />

                            {customer?.companyName && (
                                <InfoRow
                                    label="Company"
                                    value={
                                        customer.companyName
                                    }
                                />
                            )}

                            {customer?.status && (
                                <InfoRow
                                    label="Status"
                                    value={
                                        customer.status
                                    }
                                />
                            )}

                        </div>


                        {customer?._id && (
                            <button
                                type="button"
                                className={
                                    styles.viewCustomer
                                }
                                onClick={() =>
                                    router.push(
                                        `/customer/${customer._id} `
                                    )
                                }
                            >
                                View Customer →
                            </button>
                        )}

                    </section>


                    {/* =========================
                        TARGET
                    ========================= */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                🎯
                            </div>

                            <div>
                                <h3>Associated Target</h3>
                                <p>
                                    Target connected to this gift
                                </p>
                            </div>

                        </div>


                        {target ? (

                            <div className={styles.targetBox}>

                                <div className={styles.targetTitle}>
                                    {target.name}
                                </div>

                                <div
                                    className={
                                        styles.targetGrid
                                    }
                                >

                                    <InfoRow
                                        label="Type"
                                        value={formatTargetType(
                                            target.targetType
                                        )}
                                    />

                                    <InfoRow
                                        label="Category"
                                        value={
                                            target.category
                                                ? formatTargetType(
                                                    target.category
                                                )
                                                : "—"
                                        }
                                    />

                                    <InfoRow
                                        label="Target"
                                        value={`${target.targetQuantity || 0} ${target.unit || ""
                                            } `}
                                    />

                                    <InfoRow
                                        label="Status"
                                        value={
                                            target.status ||
                                            "—"
                                        }
                                    />

                                    <InfoRow
                                        label="Start Date"
                                        value={formatDate(
                                            target.startDate
                                        )}
                                    />

                                    <InfoRow
                                        label="End Date"
                                        value={formatDate(
                                            target.endDate
                                        )}
                                    />

                                </div>

                            </div>

                        ) : (

                            <div
                                className={
                                    styles.noTarget
                                }
                            >
                                <span>—</span>
                                <p>
                                    No target associated
                                    with this gift.
                                </p>
                            </div>

                        )}

                    </section>


                    {/* =========================
                        GIFT INFORMATION
                    ========================= */}

                    <section
                        className={`${styles.card} ${styles.fullWidth} `}
                    >

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                🎁
                            </div>

                            <div>
                                <h3>Gift Information</h3>
                                <p>
                                    Complete gift record
                                </p>
                            </div>

                        </div>


                        <div className={styles.detailsGrid}>

                            <DetailBox
                                label="Gift Name"
                                value={gift.name}
                            />

                            <DetailBox
                                label="Quantity"
                                value={gift.quantity}
                            />

                            <DetailBox
                                label="Estimated Value"
                                value={`₹${Number(
                                    gift.estimatedValue || 0
                                ).toLocaleString("en-IN")
                                    } `}
                            />

                            <DetailBox
                                label="Occasion"
                                value={formatOccasion(
                                    gift.occasion
                                )}
                            />

                            <DetailBox
                                label="Given Date"
                                value={formatDate(
                                    gift.givenDate
                                )}
                            />

                            <DetailBox
                                label="Recorded"
                                value={formatDateTime(
                                    gift.createdAt
                                )}
                            />

                        </div>

                    </section>


                    {/* =========================
                        NOTES
                    ========================= */}

                    {gift.notes && (
                        <section
                            className={`${styles.card} ${styles.fullWidth} `}
                        >

                            <div className={styles.cardHeader}>

                                <div className={styles.cardIcon}>
                                    📝
                                </div>

                                <div>
                                    <h3>Notes</h3>
                                    <p>
                                        Additional information
                                    </p>
                                </div>

                            </div>

                            <div className={styles.notes}>
                                {gift.notes}
                            </div>

                        </section>
                    )}

                </div>

            </div>

        </main>
    );
}


/* =========================
   INFO ROW
========================= */

function InfoRow({ label, value }) {
    return (
        <div className={styles.infoRow}>

            <span>{label}</span>

            <strong>
                {value || "—"}
            </strong>

        </div>
    );
}


/* =========================
   DETAIL BOX
========================= */

function DetailBox({ label, value }) {
    return (
        <div className={styles.detailBox}>

            <span>{label}</span>

            <strong>
                {value || "—"}
            </strong>

        </div>
    );
}

