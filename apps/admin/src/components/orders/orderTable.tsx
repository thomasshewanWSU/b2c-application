import Link from "next/link";
import Image from "next/image";
import styles from "./orderList.module.css";
import { formatPrice, ProductImage, StatusBadge } from "@repo/utils"; // Adjust the import path as necessary
type OrderTableProps = {
  orders: any[];
  formatDate: (date: string) => string;
};

export function OrderTable({ orders, formatDate }: OrderTableProps) {
  return (
    <div className={styles.orderTable} data-test-id="order-table">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} data-test-id="order-item">
              <td data-test-id="order-id">#{order.id}</td>
              <td>
                <div
                  className={styles.customerInfo}
                  data-test-id="customer-info"
                >
                  <span
                    className={styles.customerName}
                    data-test-id="customer-name"
                  >
                    {order.user.name}
                  </span>
                  <span
                    className={styles.customerEmail}
                    data-test-id="customer-email"
                  >
                    {order.user.email}
                  </span>
                </div>
              </td>
              <td data-test-id="order-date">{formatDate(order.createdAt)}</td>
              <td className={styles.statusCell} data-test-id="order-status">
                <StatusBadge
                  orderStatus={order.status}
                  variant="pill"
                  className={styles.orderDetailBadge}
                />{" "}
              </td>
              <td>
                <div className={styles.orderItems} data-test-id="order-items">
                  {order.items.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className={styles.orderItemPreview}
                      data-test-id="order-item-preview"
                    >
                      {item.product.imageUrl && (
                        <ProductImage
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={24}
                          height={24}
                          fill={false} // Important: set fill to false when using width/height
                          className={styles.orderItemImage}
                          style={{ objectFit: "cover" }}
                        />
                      )}
                      <span data-test-id="item-quantity">{item.quantity}x</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <span
                      className={styles.moreItems}
                      data-test-id="more-items"
                    >
                      +{order.items.length - 3}
                    </span>
                  )}
                </div>
              </td>
              <td className={styles.orderTotal} data-test-id="order-total">
                {formatPrice(order.total)}
              </td>
              <td>
                <div className={styles.orderActions}>
                  <Link
                    href={`/orders/${order.id}`}
                    className={styles.viewButton}
                    data-test-id="view-order-button"
                  >
                    View
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
