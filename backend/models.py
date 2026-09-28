from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Courier(Base):
    __tablename__ = "couriers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True)
    name = Column(String)

class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    quantity = Column(Integer, default=0)
    
    product = relationship("Product")
    warehouse = relationship("Warehouse")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    customer_name = Column(String)
    priority = Column(String, default="Normal") # Normal, High
    status = Column(String, default="Processing") # Received, Processing, Picking, Packing, Staged, Shipped
    due_time = Column(DateTime)
    courier_id = Column(Integer, ForeignKey("couriers.id"))
    
    courier = relationship("Courier")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class ExceptionLog(Base):
    __tablename__ = "exceptions"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    issue_type = Column(String)
    description = Column(String)
    status = Column(String, default="Open")
    reported_by = Column(String, default="Warehouse")
    time_reported = Column(DateTime, default=datetime.datetime.utcnow)
    
    order = relationship("Order")
