import { useState } from "react";
import styles from "@/styles/newCustomer.module.css";

export default function CustomerDashboard() {

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        image: "",

        address: "",
        city: "",
        state: "",
        country: "INDIA",
        pincode: "",

        notes: "",

        purchases: [],

        gifts: [],
    });


    /* =========================
       BASIC INPUT
    ========================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    /* =========================
       PRODUCTS
    ========================= */

    const addProduct = () => {

        setForm((prev) => ({
            ...prev,

            purchases: [
                ...prev.purchases,

                {
                    productName: "",
                    category: "cement",
                    quantity: "",
                    unit: "bag",
                    notes: "",
                },
            ],
        }));

    };


    const updateProduct = (index, field, value) => {

        setForm((prev) => {

            const purchases = [...prev.purchases];

            purchases[index] = {
                ...purchases[index],
                [field]: value,
            };

            return {
                ...prev,
                purchases,
            };

        });

    };


    const removeProduct = (index) => {

        setForm((prev) => ({
            ...prev,

            purchases: prev.purchases.filter(
                (_, i) => i !== index
            ),
        }));

    };


    /* =========================
       GIFTS
    ========================= */

    const addGift = () => {

        setForm((prev) => ({
            ...prev,

            gifts: [
                ...prev.gifts,

                {
                    name: "",
                    quantity: 1,
                    images: [],
                    occasion: "business",
                    notes: "",
                },
            ],
        }));

    };


    const updateGift = (index, field, value) => {

        setForm((prev) => {

            const gifts = [...prev.gifts];

            gifts[index] = {
                ...gifts[index],
                [field]: value,
            };

            return {
                ...prev,
                gifts,
            };

        });

    };


    const removeGift = (index) => {

        setForm((prev) => ({
            ...prev,

            gifts: prev.gifts.filter(
                (_, i) => i !== index
            ),
        }));

    };


    /* =========================
       SUBMIT
    ========================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!form.name || !form.phone) {
            alert("Name and phone are required");
            return;
        }

        setLoading(true);

        try {

            const payload = {

                name: form.name.trim(),

                phone: form.phone.trim(),

                email: form.email.trim(),

                image: form.image.trim(),

                addresses: [
                    {
                        address: form.address.trim(),
                        city: form.city.trim(),
                        state: form.state.trim(),
                        country: form.country.trim(),
                        pincode: form.pincode.trim(),
                        isDefault: true,
                    },
                ],

                purchases: form.purchases
                    .filter(
                        (item) =>
                            item.productName &&
                            item.quantity
                    )
                    .map((item) => ({
                        ...item,
                        quantity: Number(item.quantity),
                    })),

                gifts: form.gifts
                    .filter((gift) => gift.name)
                    .map((gift) => ({
                        ...gift,
                        quantity: Number(gift.quantity),
                    })),

                notes: form.notes.trim(),
            };

            console.log(payload);


            const response = await fetch(
                "/api/customers",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify(payload),
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to create customer"
                );
            }


            alert("Customer created successfully");


            setForm({
                name: "",
                phone: "",
                email: "",
                image: "",

                address: "",
                city: "",
                state: "",
                country: "INDIA",
                pincode: "",

                notes: "",

                purchases: [],
                gifts: [],
            });


        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            setLoading(false);

        }

    };


    return (

        <main className={styles.page}>

            {/* =========================
                HEADER
            ========================= */}

            <header className={styles.header}>

                <div>

                    <span className={styles.eyebrow}>
                        CUSTOMER MANAGEMENT
                    </span>

                    <h1>
                        Add New Customer
                    </h1>

                    <p>
                        Record customer information,
                        purchases and gifts.
                    </p>

                </div>

                <div className={styles.headerIcon}>
                    +
                </div>

            </header>


            <form
                className={styles.form}
                onSubmit={handleSubmit}
            >

                {/* =========================
                    LEFT COLUMN
                ========================= */}

                <div className={styles.leftColumn}>

                    {/* CUSTOMER */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.icon}>
                                👤
                            </div>

                            <div>
                                <h2>
                                    Customer Information
                                </h2>

                                <p>
                                    Basic details of the customer
                                </p>
                            </div>

                        </div>


                        <div className={styles.avatarSection}>

                            <div className={styles.avatar}>

                                {form.image ? (
                                    <img
                                        src={form.image}
                                        alt=""
                                    />
                                ) : (
                                    <span>
                                        {form.name
                                            ? form.name
                                                .charAt(0)
                                                .toUpperCase()
                                            : "?"}
                                    </span>
                                )}

                            </div>

                            <div>

                                <strong>
                                    Customer Photo
                                </strong>

                                <p>
                                    Add an image URL for
                                    identification.
                                </p>

                                <input
                                    className={styles.input}
                                    name="image"
                                    value={form.image}
                                    onChange={handleChange}
                                    placeholder="https://..."
                                />

                            </div>

                        </div>


                        <div className={styles.grid2}>

                            <Input
                                className={styles.input}
                                label="Full Name"
                                name="name"
                                placeholder="Rajesh Kumar"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                className={styles.input}
                                label="Phone Number"
                                name="phone"
                                placeholder="9876543210"
                                value={form.phone}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                className={styles.input}
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="customer@email.com"
                                value={form.email}
                                onChange={handleChange}
                            />

                        </div>

                    </section>


                    {/* ADDRESS */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.icon}>
                                📍
                            </div>

                            <div>

                                <h2>
                                    Address
                                </h2>

                                <p>
                                    Customer's primary location
                                </p>

                            </div>

                        </div>


                        <Input
                            className={styles.input}
                            label="Address"
                            name="address"
                            placeholder="12 Shastri Nagar"
                            value={form.address}
                            onChange={handleChange}
                            required
                        />


                        <div className={styles.grid3}>

                            <Input
                                className={styles.input}
                                label="City"
                                name="city"
                                placeholder="Udaipur"
                                value={form.city}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                className={styles.input}
                                label="State"
                                name="state"
                                placeholder="Rajasthan"
                                value={form.state}
                                onChange={handleChange}
                                required
                            />

                            <Input
                                className={styles.input}
                                label="Pincode"
                                name="pincode"
                                placeholder="313001"
                                value={form.pincode}
                                onChange={handleChange}
                            />

                        </div>

                    </section>


                    {/* NOTES */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.icon}>
                                📝
                            </div>

                            <div>

                                <h2>
                                    Customer Notes
                                </h2>

                                <p>
                                    Additional information
                                </p>

                            </div>

                        </div>


                        <textarea
                            className={styles.textarea}
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Add any useful information about this customer..."
                        />

                    </section>

                </div>


                {/* =========================
                    RIGHT COLUMN
                ========================= */}

                <div className={styles.rightColumn}>

                    {/* PURCHASES */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.icon}>
                                📦
                            </div>

                            <div className={styles.flexHeader}>

                                <div>

                                    <h2>
                                        Products Purchased
                                    </h2>

                                    <p>
                                        Record cumulative purchases
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={addProduct}
                                >
                                    + Add
                                </button>

                            </div>

                        </div>


                        {form.purchases.length === 0 && (

                            <div className={styles.empty}>

                                <span>
                                    📦
                                </span>

                                <p>
                                    No products added yet
                                </p>

                                <small>
                                    Add products purchased by
                                    this customer.
                                </small>

                            </div>

                        )}


                        <div className={styles.list}>

                            {form.purchases.map(
                                (product, index) => (

                                    <div
                                        className={styles.product}
                                        key={index}
                                    >

                                        <div className={styles.productTop}>

                                            <span>
                                                PRODUCT {index + 1}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeProduct(index)
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>


                                        <input
                                            className={styles.input}
                                            placeholder="Product name"
                                            value={
                                                product.productName
                                            }
                                            onChange={(e) =>
                                                updateProduct(
                                                    index,
                                                    "productName",
                                                    e.target.value
                                                )
                                            }
                                        />


                                        <div className={styles.grid2}>

                                            <select
                                                className={styles.select}
                                                value={
                                                    product.category
                                                }
                                                onChange={(e) =>
                                                    updateProduct(
                                                        index,
                                                        "category",
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="cement">
                                                    Cement
                                                </option>

                                                <option value="iron_rod">
                                                    Iron Rod
                                                </option>

                                                <option value="iron_sheet">
                                                    Iron Sheet
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>

                                            </select>


                                            <div
                                                className={
                                                    styles.quantity
                                                }
                                            >

                                                <input
                                                    className={styles.input}
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="Quantity"
                                                    value={
                                                        product.quantity
                                                    }
                                                    onChange={(e) =>
                                                        updateProduct(
                                                            index,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                />

                                                <select
                                                    className={styles.select}
                                                    value={
                                                        product.unit
                                                    }
                                                    onChange={(e) =>
                                                        updateProduct(
                                                            index,
                                                            "unit",
                                                            e.target.value
                                                        )
                                                    }
                                                >

                                                    <option value="bag">
                                                        Bags
                                                    </option>

                                                    <option value="ton">
                                                        Tons
                                                    </option>

                                                    <option value="piece">
                                                        Pieces
                                                    </option>

                                                </select>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </section>


                    {/* GIFTS */}

                    <section className={styles.card}>

                        <div className={styles.cardHeader}>

                            <div className={styles.icon}>
                                🎁
                            </div>

                            <div className={styles.flexHeader}>

                                <div>

                                    <h2>
                                        Gifts Given
                                    </h2>

                                    <p>
                                        Keep track of customer gifts
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className={styles.addButton}
                                    onClick={addGift}
                                >
                                    + Add
                                </button>

                            </div>

                        </div>


                        {form.gifts.length === 0 && (

                            <div className={styles.empty}>

                                <span>
                                    🎁
                                </span>

                                <p>
                                    No gifts recorded
                                </p>

                                <small>
                                    Record gifts given to this
                                    customer.
                                </small>

                            </div>

                        )}


                        <div className={styles.list}>

                            {form.gifts.map(
                                (gift, index) => (

                                    <div
                                        className={styles.gift}
                                        key={index}
                                    >

                                        <div
                                            className={
                                                styles.productTop
                                            }
                                        >

                                            <span>
                                                GIFT {index + 1}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeGift(index)
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>


                                        <input
                                            className={styles.input}
                                            placeholder="Gift name"
                                            value={gift.name}
                                            onChange={(e) =>
                                                updateGift(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                        />


                                        <div
                                            className={
                                                styles.grid2
                                            }
                                        >

                                            <select
                                                className={styles.select}
                                                value={
                                                    gift.occasion
                                                }
                                                onChange={(e) =>
                                                    updateGift(
                                                        index,
                                                        "occasion",
                                                        e.target.value
                                                    )
                                                }
                                            >

                                                <option value="business">
                                                    Business
                                                </option>

                                                <option value="festival">
                                                    Festival
                                                </option>

                                                <option value="birthday">
                                                    Birthday
                                                </option>

                                                <option value="loyalty">
                                                    Loyalty
                                                </option>

                                                <option value="special">
                                                    Special
                                                </option>

                                                <option value="other">
                                                    Other
                                                </option>

                                            </select>


                                            <input
                                                className={styles.input}
                                                type="number"
                                                min="1"
                                                placeholder="Quantity"
                                                value={
                                                    gift.quantity
                                                }
                                                onChange={(e) =>
                                                    updateGift(
                                                        index,
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                            />

                                        </div>


                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Gift notes..."
                                            value={
                                                gift.notes
                                            }
                                            onChange={(e) =>
                                                updateGift(
                                                    index,
                                                    "notes",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>

                                )
                            )}

                        </div>

                    </section>


                    {/* SAVE */}

                    <div className={styles.saveArea}>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.saveButton}
                        >

                            {loading
                                ? "Saving Customer..."
                                : "Save Customer →"}

                        </button>

                        <span>
                            Customer information will be
                            securely stored.
                        </span>

                    </div>

                </div>

            </form>

        </main>
    );
}


/* =========================
   REUSABLE INPUT
========================= */

function Input({
    label,
    name,
    type = "text",
    placeholder,
    value,
    onChange,
    required = false,
}) {

    return (

        <label className={styles.inputGroup}>

            <span>
                {label}

                {required && (
                    <b>*</b>
                )}
            </span>

            <input
                className={styles.input}
                type={type}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
            />

        </label>

    );
}