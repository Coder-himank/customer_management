import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import styles from "@/styles/targetManagement.module.css";

const emptyForm = {
    name: "",
    targetType: "quantity",
    category: "cement",
    productName: "",
    targetQuantity: "",
    unit: "bag",
    startDate: "",
    endDate: "",
    status: "draft",
    notes: "",
};

export default function TargetsPage() {

    const [targets, setTargets] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filter, setFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);

    const [editingTarget, setEditingTarget] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetchTargets();
    }, []);

    const fetchTargets = async () => {

        try {

            setLoading(true);

            const { data } =
                await axios.get("/api/targets");

            setTargets(data.targets || []);

        } catch (error) {

            console.error(
                "Failed to fetch targets",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    const openCreateModal = () => {

        setEditingTarget(null);

        setForm({
            ...emptyForm,

            startDate: getToday(),

            endDate: getToday(),
        });

        setShowModal(true);
    };

    const openEditModal = (target) => {

        setEditingTarget(target);

        setForm({
            name: target.name || "",

            targetType:
                target.targetType || "quantity",

            category:
                target.category || "cement",

            productName:
                target.productName || "",

            targetQuantity:
                target.targetQuantity ?? "",

            unit:
                target.unit || "bag",

            startDate:
                formatDateForInput(
                    target.startDate
                ),

            endDate:
                formatDateForInput(
                    target.endDate
                ),

            status:
                target.status || "draft",

            notes:
                target.notes || "",
        });

        setShowModal(true);
    };

    const closeModal = () => {

        if (saving) return;

        setShowModal(false);

        setEditingTarget(null);

        setForm(emptyForm);
    };

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCategoryChange = (e) => {

        const category = e.target.value;

        let unit = "bag";

        if (category === "iron_rod") {
            unit = "bundle";
        }

        if (category === "iron_sheet") {
            unit = "piece";
        }

        setForm((prev) => ({
            ...prev,
            category,
            unit,
        }));
    };

    const saveTarget = async (e) => {

        e.preventDefault();

        if (!form.name.trim()) {
            alert("Please enter target name.");
            return;
        }

        if (!form.targetQuantity) {
            alert("Please enter target quantity.");
            return;
        }

        if (!form.startDate || !form.endDate) {
            alert("Please select target dates.");
            return;
        }

        if (
            new Date(form.endDate) <
            new Date(form.startDate)
        ) {
            alert(
                "End date cannot be before start date."
            );
            return;
        }

        try {

            setSaving(true);

            const payload = {
                ...form,

                targetQuantity:
                    Number(form.targetQuantity),

                productName:
                    form.productName.trim() || null,
            };

            if (editingTarget) {

                const { data } =
                    await axios.put(
                        `/api/targets/${editingTarget._id}`,
                        payload
                    );

                setTargets((prev) =>
                    prev.map((target) =>
                        target._id ===
                            editingTarget._id
                            ? {
                                ...target,
                                ...data.target,
                            }
                            : target
                    )
                );

            } else {

                const { data } =
                    await axios.post(
                        "/api/targets",
                        payload
                    );

                setTargets((prev) => [
                    data.target,
                    ...prev,
                ]);
            }

            closeModal();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.error ||
                "Failed to save target."
            );

        } finally {

            setSaving(false);
        }
    };

    const deleteTarget = async () => {

        if (!editingTarget) return;

        const confirmed =
            window.confirm(
                `Delete "${editingTarget.name}"? This cannot be undone.`
            );

        if (!confirmed) return;

        try {

            setDeleting(true);

            await axios.delete(
                `/api/targets/${editingTarget._id}`
            );

            setTargets((prev) =>
                prev.filter(
                    (target) =>
                        target._id !==
                        editingTarget._id
                )
            );

            closeModal();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.error ||
                "Failed to delete target."
            );

        } finally {

            setDeleting(false);
        }
    };

    const filteredTargets =
        targets.filter((target) => {

            if (filter === "all") {
                return true;
            }

            return target.status === filter;
        });

    const activeTargets =
        targets.filter(
            (target) =>
                target.status === "active"
        ).length;

    const completedTargets =
        targets.filter(
            (target) =>
                target.status === "completed"
        ).length;

    const totalParticipants =
        targets.reduce(
            (sum, target) =>
                sum +
                (target.participants || 0),
            0
        );

    const totalGifts =
        targets.reduce(
            (sum, target) =>
                sum +
                (target.giftsGiven || 0),
            0
        );

    const totalSales =
        targets.reduce(
            (sum, target) =>
                sum +
                (target.salesGenerated || 0),
            0
        );

    const formatMoney = (value) => {

        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }
        ).format(value || 0);
    };

    const formatDate = (date) => {

        if (!date) return "-";

        return new Date(date)
            .toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }
            );
    };

    const formatDateForInput = (date) => {

        if (!date) return "";

        const d = new Date(date);

        const year =
            d.getFullYear();

        const month =
            String(
                d.getMonth() + 1
            ).padStart(2, "0");

        const day =
            String(
                d.getDate()
            ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const getToday = () => {

        const d = new Date();

        return formatDateForInput(d);
    };

    const getProgress = (target) => {

        if (!target.targetQuantity) {
            return 0;
        }

        return Math.min(
            100,
            Math.round(
                ((target.totalPurchased || 0) /
                    (target.targetQuantity * (target.participants || 1))) *
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

                    <h1>
                        Targets & Schemes
                    </h1>

                    <p>
                        Monitor sales campaigns,
                        customer progress,
                        achievements and gifts
                        from one place.
                    </p>

                </div>

                <button
                    className={styles.createButton}
                    onClick={openCreateModal}
                >
                    <span>+</span>
                    Create Target
                </button>

            </div>

            {/* KPI CARDS */}

            <div className={styles.kpiGrid}>

                <div className={styles.kpiCard}>

                    <span
                        className={styles.kpiLabel}
                    >
                        ACTIVE TARGETS
                    </span>

                    <strong>
                        {activeTargets}
                    </strong>

                    <small>
                        Currently running
                    </small>

                </div>

                <div className={styles.kpiCard}>

                    <span
                        className={styles.kpiLabel}
                    >
                        PARTICIPANTS
                    </span>

                    <strong>
                        {totalParticipants}
                    </strong>

                    <small>
                        Across all campaigns
                    </small>

                </div>

                <div className={styles.kpiCard}>

                    <span
                        className={styles.kpiLabel}
                    >
                        COMPLETED
                    </span>

                    <strong>
                        {completedTargets}
                    </strong>

                    <small>
                        Successful targets
                    </small>

                </div>

                <div className={styles.kpiCard}>

                    <span
                        className={styles.kpiLabel}
                    >
                        GIFTS GIVEN
                    </span>

                    <strong>
                        {totalGifts}
                    </strong>

                    <small>
                        Dynamically from gifts
                    </small>

                </div>

                <div className={styles.kpiCard}>

                    <span
                        className={styles.kpiLabel}
                    >
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

            {/* TOOLBAR */}

            <div className={styles.toolbar}>

                <div>
                    <h2>
                        Campaigns
                    </h2>

                    <span>
                        {filteredTargets.length}
                        {" "}
                        targets
                    </span>
                </div>

                <div className={styles.filters}>

                    {[
                        ["all", "All"],
                        ["active", "Active"],
                        ["completed", "Completed"],
                        ["draft", "Draft"],
                        ["expired", "Expired"],
                    ].map(
                        ([value, label]) => (

                            <button
                                key={value}
                                onClick={() =>
                                    setFilter(value)
                                }
                                className={
                                    filter === value
                                        ? styles.activeFilter
                                        : ""
                                }
                            >
                                {label}
                            </button>

                        )
                    )}

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

                    <h3>
                        No targets found
                    </h3>

                    <p>
                        Create your first sales
                        target to start tracking
                        customer performance.
                    </p>

                    <button
                        onClick={openCreateModal}
                        className={styles.emptyButton}
                    >
                        Create Target
                    </button>

                </div>

            ) : (

                <div className={styles.targetGrid}>

                    {filteredTargets.map(
                        (target) => {

                            const progress =
                                getProgress(
                                    target
                                );

                            return (

                                <div
                                    key={target._id}
                                    className={
                                        styles.targetCard
                                    }
                                >

                                    <div
                                        className={
                                            styles.cardTop
                                        }
                                    >

                                        <div>

                                            <span
                                                className={`${styles.status} ${styles[target.status]}`}
                                            >
                                                {
                                                    target.status
                                                }
                                            </span>

                                            <h3>
                                                {
                                                    target.name
                                                }
                                            </h3>

                                        </div>

                                        <button
                                            className={
                                                styles.editButton
                                            }
                                            onClick={() =>
                                                openEditModal(
                                                    target
                                                )
                                            }
                                        >
                                            Edit
                                        </button>

                                    </div>

                                    <div
                                        className={
                                            styles.productInfo
                                        }
                                    >

                                        <span>
                                            {
                                                target.productName ||
                                                target.category
                                            }
                                        </span>

                                        <span>
                                            {
                                                target.targetQuantity
                                            }
                                            {" "}
                                            {
                                                target.unit
                                            }
                                        </span>

                                    </div>

                                    <div
                                        className={
                                            styles.dates
                                        }
                                    >
                                        {
                                            formatDate(
                                                target.startDate
                                            )
                                        }

                                        <span>
                                            →
                                        </span>

                                        {
                                            formatDate(
                                                target.endDate
                                            )
                                        }
                                    </div>

                                    <div
                                        className={
                                            styles.progressHeader
                                        }
                                    >

                                        <span>
                                            Overall Progress
                                        </span>

                                        <strong>

                                            {target.totalPurchased || 0}/{target.targetQuantity * (target.participants || 1)} {" "}
                                            <small>
                                                ({progress}%)
                                            </small>
                                        </strong>

                                    </div>

                                    <div
                                        className={
                                            styles.progressBar
                                        }
                                    >

                                        <div
                                            style={{
                                                width:
                                                    `${progress}%`,
                                            }}
                                        />

                                    </div>

                                    <div
                                        className={
                                            styles.stats
                                        }
                                    >

                                        <div>
                                            <strong>
                                                {
                                                    target.participants ||
                                                    0
                                                }
                                            </strong>

                                            <span>
                                                Participants
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    target.completed ||
                                                    0
                                                }
                                            </strong>

                                            <span>
                                                Completed
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                {
                                                    target.giftsGiven ||
                                                    0
                                                }
                                            </strong>

                                            <span>
                                                Gifts
                                            </span>
                                        </div>

                                    </div>

                                    <div
                                        className={
                                            styles.cardBottom
                                        }
                                    >

                                        <div
                                            className={
                                                styles.sales
                                            }
                                        >

                                            <span>
                                                Sales Generated
                                            </span>

                                            <strong>
                                                {
                                                    formatMoney(
                                                        target.salesGenerated
                                                    )
                                                }
                                            </strong>

                                        </div>

                                        <Link
                                            href={`/dashboard/targets/${target._id}`}
                                            className={
                                                styles.viewButton
                                            }
                                        >
                                            View Details →
                                        </Link>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>
            )}

            {/* CREATE / EDIT MODAL */}

            {showModal && (

                <div
                    className={styles.modalOverlay}
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div
                        className={styles.modal}
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* MODAL HEADER */}

                        <div
                            className={
                                styles.modalHeader
                            }
                        >

                            <div>

                                <span
                                    className={
                                        styles.modalEyebrow
                                    }
                                >
                                    TARGET MANAGEMENT
                                </span>

                                <h2>
                                    {editingTarget
                                        ? "Edit Target"
                                        : "Create New Target"}
                                </h2>

                                <p>
                                    {editingTarget
                                        ? "Update the campaign details."
                                        : "Create a sales target for your customers."}
                                </p>

                            </div>

                            <button
                                className={
                                    styles.closeButton
                                }
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            onSubmit={saveTarget}
                            className={
                                styles.targetForm
                            }
                        >

                            {/* NAME */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label>
                                    Target Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Diwali Sariya Scheme"
                                />

                            </div>

                            {/* TYPE */}

                            <div
                                className={
                                    styles.formRow
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Target Type
                                    </label>

                                    <select
                                        name="targetType"
                                        value={
                                            form.targetType
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <option value="quantity">
                                            Quantity
                                        </option>

                                        <option value="amount">
                                            Amount
                                        </option>

                                        <option value="orders">
                                            Orders
                                        </option>

                                        <option value="product">
                                            Product
                                        </option>
                                    </select>

                                </div>

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Category
                                    </label>

                                    <select
                                        name="category"
                                        value={
                                            form.category
                                        }
                                        onChange={
                                            handleCategoryChange
                                        }
                                    >

                                        <option value="cement">
                                            Cement
                                        </option>

                                        <option value="iron_rod">
                                            Sariya / Iron Rod
                                        </option>

                                        <option value="iron_sheet">
                                            Iron Sheet
                                        </option>

                                        <option value="other">
                                            Other
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* PRODUCT */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label>
                                    Product Name
                                    <span>
                                        Optional
                                    </span>
                                </label>

                                <input
                                    name="productName"
                                    value={
                                        form.productName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="e.g. Tata Tiscon 12mm"
                                />

                            </div>

                            {/* QUANTITY */}

                            <div
                                className={
                                    styles.formRow
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Target Quantity
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        name="targetQuantity"
                                        value={
                                            form.targetQuantity
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="500"
                                    />

                                </div>

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Unit
                                    </label>

                                    <select
                                        name="unit"
                                        value={
                                            form.unit
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        <option value="bag">
                                            Bags
                                        </option>

                                        <option value="bundle">
                                            Bundles
                                        </option>

                                        <option value="piece">
                                            Pieces
                                        </option>

                                        <option value="order">
                                            Orders
                                        </option>

                                        <option value="rupee">
                                            Rupees
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {/* DATES */}

                            <div
                                className={
                                    styles.formRow
                                }
                            >

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        name="startDate"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                                <div
                                    className={
                                        styles.formGroup
                                    }
                                >

                                    <label>
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        name="endDate"
                                        value={
                                            form.endDate
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                </div>

                            </div>

                            {/* STATUS */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={
                                        form.status
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="draft">
                                        Draft
                                    </option>

                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="completed">
                                        Completed
                                    </option>

                                    <option value="expired">
                                        Expired
                                    </option>

                                    <option value="cancelled">
                                        Cancelled
                                    </option>

                                </select>

                            </div>

                            {/* NOTES */}

                            <div
                                className={
                                    styles.formGroup
                                }
                            >

                                <label>
                                    Notes
                                    <span>
                                        Optional
                                    </span>
                                </label>

                                <textarea
                                    name="notes"
                                    value={
                                        form.notes
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Add internal notes about this campaign..."
                                    rows="3"
                                />

                            </div>

                            {/* FOOTER */}

                            <div
                                className={
                                    styles.modalFooter
                                }
                            >

                                {editingTarget ? (

                                    <button
                                        type="button"
                                        className={
                                            styles.deleteButton
                                        }
                                        onClick={
                                            deleteTarget
                                        }
                                        disabled={
                                            deleting ||
                                            saving
                                        }
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Delete Target"}
                                    </button>

                                ) : (
                                    <div />
                                )}

                                <div
                                    className={
                                        styles.footerActions
                                    }
                                >

                                    <button
                                        type="button"
                                        className={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            closeModal
                                        }
                                        disabled={
                                            saving ||
                                            deleting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={
                                            styles.saveButton
                                        }
                                        disabled={
                                            saving ||
                                            deleting
                                        }
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingTarget
                                                ? "Save Changes"
                                                : "Create Target"}
                                    </button>

                                </div>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}