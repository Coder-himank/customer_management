import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "@/styles/PurchaseManagement.module.css";
import { useRouter } from "next/router";

export default function PurchaseManagement() {
    const [purchases, setPurchases] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPurchase, setEditingPurchase] = useState(null);

    const [search, setSearch] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");

    const [filteredPurchases, setFilteredPurchases] = useState([]);
    const router = useRouter();

    const [form, setForm] = useState({
        customerId: "",
        productName: "",
        category: "cement",
        quantity: "",
        unit: "bag",
        rate: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
    });

    /* =========================
       FETCH DATA
    ========================= */

    const fetchData = async () => {
        try {
            setLoading(true);

            const [purchaseRes, customerRes] = await Promise.all([
                axios.get("/api/purchases"),
                axios.get("/api/customers"),
            ]);

            setPurchases(purchaseRes.data.data || []);
            setFilteredPurchases(purchaseRes.data.data || []);
            setCustomers(customerRes.data.customers || []);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* =========================
       FORM
    ========================= */

    const openAddModal = () => {
        setEditingPurchase(null);

        setForm({
            customerId: "",
            productName: "",
            category: "cement",
            quantity: "",
            unit: "bag",
            rate: "",
            date: new Date().toISOString().slice(0, 10),
            notes: "",
        });

        setCustomerSearch("");
        setModalOpen(true);
    };

    const openEditModal = (purchase) => {
        setEditingPurchase(purchase);

        setForm({
            customerId: purchase.customerId?._id || purchase.customerId,
            productName: purchase.productName || "",
            category: purchase.category || "cement",
            quantity: purchase.quantity || "",
            unit: purchase.unit || "bag",
            rate: purchase.rate || "",
            date: purchase.date
                ? new Date(purchase.date).toISOString().slice(0, 10)
                : "",
            notes: purchase.notes || "",
        });

        const customer = customers.find(
            (c) =>
                c._id ===
                (purchase.customerId?._id || purchase.customerId)
        );

        setCustomerSearch(customer?.name || "");

        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingPurchase(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            // Sariya is always measured in bundles
            if (name === "category" && value === "iron_rod") {
                updated.unit = "bundle";
            }

            // Cement is measured in bags
            if (name === "category" && value === "cement") {
                updated.unit = "bag";
            }

            return updated;
        });
    };

    /* =========================
       CUSTOMER SEARCH
    ========================= */

    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return [];

        const query = customerSearch.toLowerCase();

        return customers
            .filter((customer) => {
                return (
                    customer.name?.toLowerCase().includes(query) ||
                    customer.phone?.toString().includes(query) ||
                    customer.companyName?.toLowerCase().includes(query)
                );
            })
            .slice(0, 8);
    }, [customerSearch, customers]);

    const selectCustomer = (customer) => {
        setForm((prev) => ({
            ...prev,
            customerId: customer._id,
        }));

        setCustomerSearch(customer.name);
    };

    const selectedCustomer = customers.find(
        (customer) => customer._id === form.customerId
    );

    /* =========================
       TOTAL
    ========================= */

    const totalAmount =
        Number(form.quantity || 0) * Number(form.rate || 0);

    /* =========================
       SAVE
    ========================= */

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.customerId) {
            alert("Please select a customer from the database.");
            return;
        }

        if (!form.productName || !form.quantity) {
            alert("Product and quantity are required.");
            return;
        }

        try {
            const payload = {
                ...form,
                quantity: Number(form.quantity),
                rate: Number(form.rate || 0),
                totalAmount,
            };

            if (editingPurchase) {
                await axios.put(
                    `/api/purchases/${editingPurchase._id}`,
                    payload
                );
            } else {
                await axios.post("/api/purchases", payload);
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error(error);
            alert(
                error.response?.data?.error ||
                "Failed to save purchase."
            );
        }
    };

    /* =========================
       DELETE
    ========================= */

    const deletePurchase = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this purchase?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(`/api/purchases/${id}`);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to delete purchase.");
        }
    };

    /* =========================
       FILTER
    ========================= */

    const filterPurchases = () => {

        setFilteredPurchases(purchases.filter((purchase) => {
            const query = search.toLowerCase();



            const customerName =
                purchase.customerId?.name ||
                purchase.customerName ||
                "";

            return (
                customerName.toLowerCase().includes(query) ||
                purchase.productName?.toLowerCase().includes(query) ||
                purchase.category?.toLowerCase().includes(query)
            );
        }));
    }

    return (
        <div className={styles.page}>

            {/* HEADER */}

            <div className={styles.header}>

                <div>
                    <span className={styles.eyebrow}>
                        BUSINESS MANAGEMENT
                    </span>

                    <h1>Purchase Management</h1>

                    <p>
                        Record and manage customer purchases.
                    </p>
                </div>

                <button
                    className={styles.primaryButton}
                    onClick={openAddModal}
                >
                    + New Purchase
                </button>

            </div>

            {/* SEARCH */}

            <div className={styles.toolbar}>

                <input
                    type="text"
                    placeholder="Search customer, product..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className={styles.count}>
                    {filteredPurchases.length} purchases
                </div>

            </div>

            {/* TABLE */}

            <div className={styles.tableCard}>

                {loading ? (
                    <div className={styles.empty}>
                        Loading purchases...
                    </div>
                ) : filteredPurchases.length === 0 ? (
                    <div className={styles.empty}>
                        No purchases found.
                    </div>
                ) : (

                    <table>

                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Rate</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>

                            {filteredPurchases.map((purchase) => (

                                <tr key={purchase._id} >

                                    <td>
                                        <strong>
                                            {purchase.customerId?.name ||
                                                "Unknown"}
                                        </strong>

                                        <small>
                                            {purchase.customerId?.phone ||
                                                ""}
                                        </small>
                                    </td>

                                    <td>
                                        {purchase.productName}
                                    </td>

                                    <td>
                                        <span className={styles.badge}>
                                            {purchase.category}
                                        </span>
                                    </td>

                                    <td>
                                        {purchase.quantity}{" "}
                                        {purchase.unit}
                                    </td>

                                    <td>
                                        ₹
                                        {Number(
                                            purchase.rate || 0
                                        ).toLocaleString("en-IN")}
                                    </td>

                                    <td>
                                        <strong>
                                            ₹
                                            {Number(
                                                purchase.totalAmount || 0
                                            ).toLocaleString("en-IN")}
                                        </strong>
                                    </td>

                                    <td>
                                        {purchase.date
                                            ? new Date(
                                                purchase.date
                                            ).toLocaleDateString("en-IN")
                                            : "-"}
                                    </td>

                                    <td>

                                        <div className={styles.actions}>

                                            <button
                                                onClick={() =>
                                                    openEditModal(purchase)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className={styles.delete}
                                                onClick={() =>
                                                    deletePurchase(
                                                        purchase._id
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>
                                            <button
                                                className={styles.visit}
                                                onClick={() =>
                                                    router.push(`/dashboard/purchases/${purchase._id}`)
                                                }
                                            >
                                                Visit
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                )}

            </div>

            {/* MODAL */}

            {modalOpen && (

                <div
                    className={styles.overlay}
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal();
                        }
                    }}
                >

                    <div className={styles.modal}>

                        <div className={styles.modalHeader}>

                            <div>
                                <span>
                                    {editingPurchase
                                        ? "EDIT PURCHASE"
                                        : "NEW PURCHASE"}
                                </span>

                                <h2>
                                    {editingPurchase
                                        ? "Edit Purchase"
                                        : "Add Purchase"}
                                </h2>
                            </div>

                            <button
                                className={styles.close}
                                onClick={closeModal}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* CUSTOMER */}

                            <div className={styles.field}>

                                <label>Customer *</label>

                                {selectedCustomer ? (

                                    <div className={styles.selectedCustomer}>

                                        <div>
                                            <strong>
                                                {selectedCustomer.name}
                                            </strong>

                                            <span>
                                                {selectedCustomer.phone}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    customerId: "",
                                                }));

                                                setCustomerSearch("");
                                            }}
                                        >
                                            Change
                                        </button>

                                    </div>

                                ) : (

                                    <>
                                        <input
                                            type="text"
                                            placeholder="Search verified customer..."
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(
                                                    e.target.value
                                                );

                                                setForm((prev) => ({
                                                    ...prev,
                                                    customerId: "",
                                                }));
                                            }}
                                        />

                                        {filteredCustomers.length > 0 && (

                                            <div
                                                className={
                                                    styles.customerDropdown
                                                }
                                            >

                                                {filteredCustomers.map(
                                                    (customer) => (

                                                        <button
                                                            type="button"
                                                            key={customer._id}
                                                            onClick={() =>
                                                                selectCustomer(
                                                                    customer
                                                                )
                                                            }
                                                        >

                                                            <strong>
                                                                {customer.name}
                                                            </strong>

                                                            <span>
                                                                {customer.phone}
                                                                {customer.companyName
                                                                    ? ` • ${customer.companyName}`
                                                                    : ""}
                                                            </span>

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </>

                                )}

                            </div>

                            {/* PRODUCT */}

                            <div className={styles.grid}>

                                <div className={styles.field}>

                                    <label>Category *</label>

                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
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

                                <div className={styles.field}>

                                    <label>Product Name *</label>

                                    <input
                                        name="productName"
                                        value={form.productName}
                                        onChange={handleChange}
                                        placeholder="e.g. JK Cement"
                                    />

                                </div>

                            </div>

                            {/* QUANTITY */}

                            <div className={styles.grid}>

                                <div className={styles.field}>

                                    <label>Quantity *</label>

                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        step={form.category === "iron_rod" ? "1" : "0.01"}
                                        value={form.quantity}
                                        onChange={handleChange}
                                        placeholder="100"
                                    />

                                </div>

                                <div className={styles.field}>

                                    <label>Unit *</label>

                                    <select
                                        name="unit"
                                        value={form.unit}
                                        onChange={handleChange}
                                        disabled={form.category === "iron_rod"}
                                    >
                                        {form.category === "cement" && (
                                            <option value="bag">Bags</option>
                                        )}

                                        {form.category === "iron_rod" && (
                                            <option value="bundle">Bundles</option>
                                        )}

                                        {form.category === "iron_sheet" && (
                                            <option value="piece">Pieces</option>
                                        )}

                                        {form.category === "other" && (
                                            <>
                                                <option value="bag">Bags</option>
                                                <option value="bundle">Bundles</option>
                                                <option value="kg">Kg</option>
                                                <option value="ton">Tons</option>
                                                <option value="piece">Pieces</option>
                                            </>
                                        )}
                                    </select>

                                </div>

                            </div>

                            {/* RATE */}

                            <div className={styles.grid}>

                                <div className={styles.field}>

                                    <label>Rate</label>

                                    <input
                                        type="number"
                                        name="rate"
                                        min="0"
                                        value={form.rate}
                                        onChange={handleChange}
                                        placeholder="380"
                                    />

                                </div>

                                <div className={styles.field}>

                                    <label>Date *</label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                    />

                                </div>

                            </div>

                            {/* TOTAL */}

                            <div className={styles.totalBox}>

                                <span>Total Amount</span>

                                <strong>
                                    ₹
                                    {totalAmount.toLocaleString(
                                        "en-IN"
                                    )}
                                </strong>

                            </div>

                            {/* NOTES */}

                            <div className={styles.field}>

                                <label>Notes</label>

                                <textarea
                                    name="notes"
                                    value={form.notes}
                                    onChange={handleChange}
                                    placeholder="Optional notes..."
                                />

                            </div>

                            <button
                                type="submit"
                                className={styles.saveButton}
                            >
                                {editingPurchase
                                    ? "Save Changes"
                                    : "Add Purchase"}
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}