import database
import models
from datetime import datetime, timedelta
import random

def seed_db():
    db = database.SessionLocal()
    
    # Drop and recreate (for clean state)
    database.Base.metadata.drop_all(bind=database.engine)
    database.Base.metadata.create_all(bind=database.engine)
    
    wh1 = models.Warehouse(name="Main Warehouse")
    wh2 = models.Warehouse(name="Overflow Warehouse")
    db.add_all([wh1, wh2])
    
    c1 = models.Courier(name="Delhivery")
    c2 = models.Courier(name="BlueDart")
    c3 = models.Courier(name="Ecom Express")
    db.add_all([c1, c2, c3])
    db.commit()
    
    # Products
    products = [
        models.Product(sku="SHOE-204", name="Nike Running Shoe (Black/Size 9)"),
        models.Product(sku="SHOE-205", name="Nike Running Shoe (White/Size 10)"),
        models.Product(sku="TS-102", name="Basic T-Shirt (M)"),
        models.Product(sku="HD-301", name="Premium Hoodie (L)"),
        models.Product(sku="BK-501", name="Travel Backpack"),
        models.Product(sku="MG-001", name="Coffee Mug"),
        models.Product(sku="KB-999", name="Mechanical Keyboard"),
        models.Product(sku="MS-888", name="Wireless Mouse")
    ]
    db.add_all(products)
    db.commit()
    
    # Inventory
    for p in products:
        qty_main = random.randint(0, 10)
        qty_over = random.randint(0, 20)
        # force some specific scenarios
        if p.sku == 'TS-102':
            qty_main = 0
            qty_over = 15
        if p.sku == 'BK-501':
            qty_main = 0
            qty_over = 0
        
        db.add(models.Inventory(product_id=p.id, warehouse_id=wh1.id, quantity=qty_main))
        db.add(models.Inventory(product_id=p.id, warehouse_id=wh2.id, quantity=qty_over))
    
    db.commit()
    
    # Orders
    statuses = ["Received", "Processing", "Picking", "Packing", "Staged", "Shipped"]
    priorities = ["Normal", "High"]
    names = ["Rahul Sharma", "Neha Gupta", "Amit Singh", "Priya Desai", "Vikram Rathore", "Sonia Patel", "Karan Johar", "Riya Sen"]
    
    orders_list = []
    for i in range(1, 51):
        priority = "High" if random.random() > 0.8 else "Normal"
        status = random.choice(statuses)
        if i == 1:
            priority = "High"
            status = "Picking"
            due = datetime.now().replace(hour=14, minute=0, second=0, microsecond=0)
        elif i == 2:
            priority = "Normal"
            status = "Packing"
            due = datetime.now().replace(hour=16, minute=0, second=0, microsecond=0)
        elif i == 3:
            priority = "High"
            status = "Processing"
            due = datetime.now().replace(hour=14, minute=30, second=0, microsecond=0)
        else:
            due = datetime.now() + timedelta(hours=random.randint(1, 48))
            
        o = models.Order(
            order_number=f"ORD-{1041+i}",
            customer_name=random.choice(names),
            priority=priority,
            status=status,
            due_time=due,
            courier_id=random.choice([c1.id, c2.id, c3.id])
        )
        orders_list.append(o)
    db.add_all(orders_list)
    db.commit()
    
    # Order items
    for o in orders_list:
        num_items = random.randint(1, 3)
        for _ in range(num_items):
            db.add(models.OrderItem(order_id=o.id, product_id=random.choice(products).id, quantity=random.randint(1, 2)))
            
    db.commit()
    
    # Exceptions
    db.add(models.ExceptionLog(
        order_id=orders_list[0].id,
        issue_type="Inventory mismatch",
        description="SKU SHOE-204 not found in bin A2",
        status="Open"
    ))
    db.add(models.ExceptionLog(
        order_id=orders_list[5].id,
        issue_type="Courier pickup delayed",
        description="Delhivery driver vehicle broke down",
        status="Investigating"
    ))
    db.add(models.ExceptionLog(
        order_id=orders_list[12].id,
        issue_type="Wrong variant detected",
        description="Packed Black instead of White",
        status="Resolved"
    ))
    db.commit()
    
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
