import { formatDate } from "@repo/utils/";
// Handle order status update
export const updateOrderStatus = async ({
  orderId,
  newStatus,
  currentStatus,
  setLoading,
  setCurrentStatus,
  setError,
  setSuccess,
}: {
  orderId: number;
  newStatus: string;
  currentStatus: string;
  setLoading: (loading: boolean) => void;
  setCurrentStatus: (status: string) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}) => {
  if (newStatus === currentStatus) return;

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    });

    const data = await response.json();

    if (response.ok) {
      setCurrentStatus(newStatus);
      setSuccess(`Order status updated to ${newStatus}`);
    } else {
      setError(data.message || "Failed to update order status");
    }
  } catch (err) {
    setError("An unexpected error occurred");
    console.error(err);
  } finally {
    setLoading(false);
  }
};

// Function to save order notes
export const saveOrderNotes = async ({
  orderId,
  notes,
  setSavingNotes,
  setError,
  setSuccess,
}: {
  orderId: number;
  notes: string;
  setSavingNotes: (saving: boolean) => void;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
}) => {
  setSavingNotes(true);
  setError("");
  setSuccess("");

  try {
    const response = await fetch(`/api/orders/${orderId}/notes`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ notes }),
    });

    const data = await response.json();

    if (response.ok) {
      setSuccess("Notes saved successfully");
    } else {
      setError(data.message || "Failed to save notes");
    }
  } catch (err) {
    setError("An unexpected error occurred");
    console.error(err);
  } finally {
    setSavingNotes(false);
  }
};

// Function to handle printing invoice
export const printOrderInvoice = (
  order: any,
  formatPrice: (price: number) => string,
) => {
  // Open a new window with formatted invoice content
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    interface OrderItem {
      product: {
        name: string;
      };
      quantity: number;
      price: number;
    }

    interface OrderUser {
      name?: string;
      email: string;
    }

    interface Order {
      id: number;
      createdAt: string | Date;
      user: OrderUser;
      shippingAddress: string;
      items: OrderItem[];
      total: number;
    }

    printWindow.document.write(`
                <html>
                    <head>
                        <title>Invoice - Order #${order.id}</title>
                        <style>
                            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
                            .company-info { margin-bottom: 30px; }
                            .customer-info { margin-bottom: 30px; }
                            h1 { font-size: 24px; color: #333; margin: 0 0 5px 0; }
                            h2 { font-size: 18px; color: #555; margin: 0 0 15px 0; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th { background: #f5f5f5; text-align: left; padding: 10px; }
                            td { padding: 10px; text-align: left; border-bottom: 1px solid #eee; }
                            .amount { text-align: right; }
                            .totals { margin-top: 30px; text-align: right; }
                            .total-row { margin: 5px 0; }
                            .grand-total { font-weight: bold; font-size: 18px; margin-top: 15px; }
                            .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; }
                            @media print {
                                body { padding: 0; }
                                button { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="invoice-header">
                            <div>
                                <h1>INVOICE</h1>
                                <p>Order #${order.id}</p>
                            </div>
                            <div>
                                <p>Date: ${formatDate(order.createdAt)}</p>
                            </div>
                        </div>
                        
                        <div class="company-info">
                            <h2>Your Company Name</h2>
                            <p>123 Business Street<br>
                            City, State 12345<br>
                            support@example.com</p>
                        </div>
                        
                        <div class="customer-info">
                            <h2>Bill To</h2>
                            <p>${order.user.name || "Customer"}<br>
                            ${order.user.email}<br>
                            ${order.shippingAddress.replace(/,/g, "<br>")}</p>
                        </div>
                        
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th class="amount">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items
                                  .map(
                                    (item: OrderItem) => `
                                    <tr>
                                        <td>${item.product.name}</td>
                                        <td>${item.quantity}</td>
                                        <td>${formatPrice(item.price)}</td>
                                        <td class="amount">${formatPrice(item.price * item.quantity)}</td>
                                    </tr>
                                `,
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                        
                        <div class="totals">
                            <div class="total-row">Subtotal: ${formatPrice(order.items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0))}</div>
                            <div class="total-row">Shipping: ${formatPrice(order.total - order.items.reduce((sum: number, item: OrderItem) => sum + item.price * item.quantity, 0))}</div>
                            <div class="grand-total">Total: ${formatPrice(order.total)}</div>
                        </div>
                        
                        <div class="footer">
                            <p>Thank you for your business!</p>
                        </div>
                        
                        <script>
                            window.onload = function() {
                                window.print();
                            }
                        </script>
                    </body>
                </html>
            `);
    printWindow.document.close();
  }
};
