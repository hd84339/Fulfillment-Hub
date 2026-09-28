from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class ProductBase(BaseModel):
    sku: str
    name: str

class Product(ProductBase):
    id: int
    class Config:
        orm_mode = True

class WarehouseBase(BaseModel):
    name: str

class Warehouse(WarehouseBase):
    id: int
    class Config:
        orm_mode = True

class CourierBase(BaseModel):
    name: str

class Courier(CourierBase):
    id: int
    class Config:
        orm_mode = True

class Inventory(BaseModel):
    id: int
    quantity: int
    warehouse: Warehouse
    class Config:
        orm_mode = True

class OrderItem(BaseModel):
    id: int
    quantity: int
    product: Product
    class Config:
        orm_mode = True

class Order(BaseModel):
    id: int
    order_number: str
    customer_name: str
    priority: str
    status: str
    due_time: datetime
    courier: Optional[Courier]
    items: List[OrderItem] = []
    class Config:
        orm_mode = True

class ExceptionLog(BaseModel):
    id: int
    order: Optional[Order]
    issue_type: str
    description: str
    status: str
    reported_by: str
    time_reported: datetime
    class Config:
        orm_mode = True

class DashboardStats(BaseModel):
    orders_today: int
    pending_processing: int
    priority_orders: int
    at_risk: int
    inventory_issues: int
    ready_for_pickup: int

class InventoryStatus(BaseModel):
    sku: str
    product_name: str
    main_warehouse: int
    overflow: int
    available: int
    status: str
