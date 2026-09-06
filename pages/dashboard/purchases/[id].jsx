import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "@/styles/purchaseDetail.module.css";

export default function PurchaseDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchPurchase = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    `/api/purchases/${id}`
                );

                const data =
                    response.data?.purchase ||
                    response.data?.data ||
                    response.data;

                setPurchase(data);

            } catch (err) {
                console.error(
                    "Failed to fetch purchase:",
                    err
                );

                setError(
                    err.response?.data?.error ||
                    "Unable to load purchase details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPurchase();
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


    const formatCategory = (category) => {
        if (!category) return "—";

        return category
            .split("_")
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(" ");
    };


    const formatUnit = (unit) => {
        const units = {
            bag: "Bags",
            bundle: "Bundles",
            kg: "KG",
            ton: "Tons",
            piece: "Pieces",
        };

        return units[unit] || unit || "—";
    };


    if (loading) {
        return (
            <main className={styles.page}>
                <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading purchase details...</p>
                </div>
            </main>
        );
    }


    if (error || !purchase) {
        return (
            <main className={styles.page}>
                <div className={styles.errorCard}>

                    <div className={styles.errorIcon}>
                        !
                    </div>

                    <h2>Purchase Not Found</h2>

                    <p>
                        {error ||
                            "The requested purchase could not be found."}
                    </p>

                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() =>
                            router.push("/dashboard/purchases")
                        }
                    >
                        ← Back to Purchases
                    </button>

                </div>
            </main>
        );
    }


    const customer = purchase.customerId;

    const quantity = Number(
        purchase.quantity || 0
    );

    const rate = Number(
        purchase.rate || 0
    );

    const totalAmount = Number(
        purchase.totalAmount || 0
    );


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
                        router.push("/dashboard/purchases")
                    }
                >
                    ← Back
                </button>

                <div className={styles.headerContent}>

                    <div>

                        <span className={styles.eyebrow}>
                            PURCHASE MANAGEMENT
                        </span>

                        <h1>Purchase Details</h1>

                        <p>
                            Complete information about
                            this customer purchase.
                        </p>

                    </div>

                    <div className={styles.headerIcon}>
                        📦
                    </div>

                </div>

            </header>


            <div className={styles.container}>

                {/* =========================
                    PURCHASE HERO
                ========================= */}

                <section className={styles.heroCard}>

                    <div className={styles.productIcon}>
                        📦
                    </div>

                    <div className={styles.heroInfo}>

                        <span className={styles.categoryBadge}>
                            {formatCategory(
                                purchase.category
                            )}
                        </span>

                        <h2>
                            {purchase.productName}
                        </h2>

                        <p>
                            Purchased on{" "}
                            <strong>
                                {formatDate(
                                    purchase.date
                                )}
                            </strong>
                        </p>

                    </div>

                    <div className={styles.heroAmount}>

                        <span>Total Amount</span>

                        <strong>
                            ₹
                            {totalAmount.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

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
                                    Customer who made
                                    this purchase
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

                            <InfoRow
                                label="City"
                                value={
                                    customer?.addresses[0]?.city ||
                                    "—"
                                }
                            />

                            <InfoRow
                                label="State"
                                value={
                                    customer?.addresses[0]?.state ||
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
                                        `/customer/${customer._id}`
                                    )
                                }
                            >
                                View Customer →
                            </button>
                        )}

                    </section>


                    {/* =========================
                        PRODUCT
                    ========================= */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                📦
                            </div>

                            <div>
                                <h3>Product</h3>

                                <p>
                                    Purchased product
                                    information
                                </p>
                            </div>

                        </div>


                        <div className={styles.productDetails}>

                            <div className={styles.productName}>
                                {purchase.productName}
                            </div>

                            <div
                                className={
                                    styles.productCategory
                                }
                            >
                                {formatCategory(
                                    purchase.category
                                )}
                            </div>

                        </div>


                        <div className={styles.infoList}>

                            <InfoRow
                                label="Quantity"
                                value={`${quantity} ${formatUnit(
                                    purchase.unit
                                )}`}
                            />

                            <InfoRow
                                label="Rate"
                                value={`₹${rate.toLocaleString(
                                    "en-IN"
                                )}`}
                            />

                            <InfoRow
                                label="Total"
                                value={`₹${totalAmount.toLocaleString(
                                    "en-IN"
                                )}`}
                            />

                        </div>

                    </section>


                    {/* =========================
                        PURCHASE SUMMARY
                    ========================= */}

                    <section
                        className={`${styles.card} ${styles.fullWidth}`}
                    >

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                📊
                            </div>

                            <div>
                                <h3>Purchase Summary</h3>

                                <p>
                                    Financial and quantity
                                    breakdown
                                </p>
                            </div>

                        </div>


                        <div className={styles.summaryGrid}>

                            <SummaryBox
                                label="Product"
                                value={
                                    purchase.productName
                                }
                            />

                            <SummaryBox
                                label="Category"
                                value={formatCategory(
                                    purchase.category
                                )}
                            />

                            <SummaryBox
                                label="Quantity"
                                value={`${quantity} ${formatUnit(
                                    purchase.unit
                                )}`}
                            />

                            <SummaryBox
                                label="Rate"
                                value={`₹${rate.toLocaleString(
                                    "en-IN"
                                )}`}
                            />

                            <SummaryBox
                                label="Total Amount"
                                value={`₹${totalAmount.toLocaleString(
                                    "en-IN"
                                )}`}
                                highlight
                            />

                            <SummaryBox
                                label="Purchase Date"
                                value={formatDate(
                                    purchase.date
                                )}
                            />

                        </div>

                    </section>


                    {/* =========================
                        NOTES
                    ========================= */}

                    {purchase.notes && (
                        <section
                            className={`${styles.card} ${styles.fullWidth}`}
                        >

                            <div className={styles.cardHeader}>

                                <div className={styles.cardIcon}>
                                    📝
                                </div>

                                <div>
                                    <h3>Notes</h3>

                                    <p>
                                        Additional purchase
                                        information
                                    </p>
                                </div>

                            </div>

                            <div className={styles.notes}>
                                {purchase.notes}
                            </div>

                        </section>
                    )}


                    {/* =========================
                        RECORD INFORMATION
                    ========================= */}

                    <section
                        className={`${styles.card} ${styles.fullWidth}`}
                    >

                        <div className={styles.cardHeader}>

                            <div className={styles.cardIcon}>
                                ℹ️
                            </div>

                            <div>
                                <h3>Record Information</h3>

                                <p>
                                    System record details
                                </p>
                            </div>

                        </div>


                        <div className={styles.recordGrid}>

                            <InfoRow
                                label="Purchase ID"
                                value={purchase._id}
                            />

                            <InfoRow
                                label="Purchase Date"
                                value={formatDateTime(
                                    purchase.date
                                )}
                            />

                            <InfoRow
                                label="Created"
                                value={formatDateTime(
                                    purchase.createdAt
                                )}
                            />

                            <InfoRow
                                label="Last Updated"
                                value={formatDateTime(
                                    purchase.updatedAt
                                )}
                            />

                        </div>

                    </section>

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
   SUMMARY BOX
========================= */

function SummaryBox({
    label,
    value,
    highlight = false,
}) {
    return (
        <div
            className={`${styles.summaryBox} ${highlight
                ? styles.highlight
                : ""
                }`}
        >

            <span>{label}</span>

            <strong>
                {value || "—"}
            </strong>

        </div>
    );
}