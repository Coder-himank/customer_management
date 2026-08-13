import styles from "@/styles/customerDashboard.module.css"
import { useEffect, useState } from "react"

const customerDashboard = ({ customerId }) => {

    const [customer, setCustomer] = useState({})
    useEffect(() => {
        const fetchCustomerData = async () => {

            const response = await axios.get(`/api/customer?data=id&cid=${customerId}`)
            setCustomer(response.data.data)
        }

        // fetchCustomerData()
    }, [])

    return (

        <>

            <div className={styles.profile}>

                <div className={styles.avatar}>
                    <img src="/vercel.svg" alt={customer.name} />
                </div>

                <div className={styles.profileInfo}>
                    <h1>{customer.name}</h1>

                    <p>
                        {customer.phone}
                        {" · "}
                        {customer.address?.[0]?.city},{" "}
                        {customer.address?.[0]?.state}
                    </p>
                </div>

                <div className={styles.customerBadge}>
                    HIGH VALUE
                </div>

            </div>

            <div className={styles.stats}>

                <div className={styles.statCard}>
                    <span>Total Orders</span>
                    <strong>{customer.totalOrders}</strong>
                    <small>All time</small>
                </div>

                <div className={styles.statCard}>
                    <span>Total Products</span>
                    <strong>{customer.totalQuantity}</strong>
                    <small>Units purchased</small>
                </div>

                <div className={styles.statCard}>
                    <span>Total Spent</span>
                    <strong>₹{customer.totalSpent}</strong>
                    <small>Lifetime value</small>
                </div>

                <div className={styles.statCard}>
                    <span>Customer Rank</span>
                    <strong>#{customer.rank}</strong>
                    <small>Among all customers</small>
                </div>

            </div>

            <div className={styles.comparison}>

                <div className={styles.comparisonHeader}>
                    <div>
                        <span>Purchase Performance</span>
                        <h2>Top 3% of customers</h2>
                    </div>

                    <div className={styles.rank}>
                        #12
                        <small>/ 486</small>
                    </div>
                </div>

                <div className={styles.progress}>

                    <div
                        className={styles.progressFill}
                        style={{
                            width: `${customer.percentile}%`
                        }}
                    />

                </div>

                <div className={styles.comparisonValues}>

                    <div>
                        <span>Average customer</span>
                        <strong>
                            {customer.averagePurchase} bags
                        </strong>
                    </div>

                    <div>
                        <span>This customer</span>
                        <strong>
                            {customer.totalQuantity} bags
                        </strong>
                    </div>

                </div>

            </div>

            <div className={styles.productSection}>

                <div className={styles.sectionHeader}>
                    <div>
                        <span>Purchase Analysis</span>
                        <h2>Products Purchased</h2>
                    </div>
                </div>

                {customer.products?.map((product) => (

                    <div
                        className={styles.productRow}
                        key={product.pname}
                    >

                        <div className={styles.productName}>
                            <strong>{product.pname}</strong>
                            <span>
                                {product.orders} orders
                            </span>
                        </div>

                        <div className={styles.productBar}>
                            <div
                                style={{
                                    width: `${product.percentage}%`
                                }}
                            />
                        </div>

                        <strong className={styles.quantity}>
                            {product.qty} bags
                        </strong>

                    </div>

                ))}

            </div>

            <div className={styles.history}>

                <h2>Purchase History</h2>

                {customer.orders?.map((order) => (

                    <div
                        className={styles.orderRow}
                        key={order._id}
                    >

                        <div>
                            <strong>{order.product}</strong>
                            <span>{order.date}</span>
                        </div>

                        <span>{order.quantity} bags</span>

                        <strong>₹{order.amount}</strong>

                    </div>

                ))}

            </div>
        </>
    )
}

export default customerDashboard;