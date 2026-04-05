import { getRecentOrders } from "@/services/order-api"
import { OrderRecentRes } from "@/types/order"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export function useDashboard() {
    const [recentOrders, setRecentOrders] = useState<OrderRecentRes[]>([])
    useEffect(() => {
        const fetchRecentOrders = async () => {
            const orders = await getRecentOrders(5)
            setRecentOrders(orders)
        }
        fetchRecentOrders()
    }, [])
    return{
        recentOrders
    }
}