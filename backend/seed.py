import database
import models
from datetime import datetime, timedelta
import random

def seed_db():
    db = database.SessionLocal()
    
    # Drop and recreate
    database.Base.metadata.drop_all(bind=database.engine)
    database.Base.metadata.create_all(bind=database.engine)
    
    wh1 = models.Warehouse(name="Main Warehouse")
    wh2 = models.Warehouse(name="Overflow Warehouse")
    db.add_all([wh1, wh2])
    
    c1 = models.Courier(name="Delhivery")
    c2 = models.Courier(name="BlueDart")
    db.add_all([c1, c2])
    db.commit()
    
    # Products
    demo_product = models.Product(sku="SH-204", name="Running Shoe (Black / Size 9)")
    p2 = models.Product(sku="TS-102", name="Black T-Shirt")
    p3 = models.Product(sku="HD-301", name="Premium Hoodie")
    p4 = models.Product(sku="BK-501", name="Travel Backpack")
    p5 = models.Product(sku="MG-001", name="Coffee Mug")
    db.add_all([demo_product, p2, p3, p4, p5])
    db.commit()
    
    # Inventory for demo scenario: Main=0, Overflow=12
    db.add(models.Inventory(product_id=demo_product.id, warehouse_id=wh1.id, quantity=0))
    db.add(models.Inventory(product_id=demo_product.id, warehouse_id=wh2.id, quantity=12))
    
    # TS-102 also low in main
    db.add(models.Inventory(product_id=p2.id, warehouse_id=wh1.id, quantity=0))
    db.add(models.Inventory(product_id=p2.id, warehouse_id=wh2.id, quantity=15))
    
    # Others
    db.add(models.Inventory(product_id=p3.id, warehouse_id=wh1.id, quantity=5))
    db.add(models.Inventory(product_id=p3.id, warehouse_id=wh2.id, quantity=0))
    
    db.commit()
    
    names = ["Rahul Sharma", "Neha Gupta", "Amit Singh", "Priya Desai"]
    
    # Specific Demo Order ORD-1042
    demo_order = models.Order(
        order_number="ORD-1042",
        customer_name="Demo User",
        priority="High",
        status="Picking",
        due_time=datetime.now() + timedelta(minutes=32),
        courier_id=c1.id
    )
    db.add(demo_order)
    db.commit()
    db.add(models.OrderItem(order_id=demo_order.id, product_id=demo_product.id, quantity=1))
    
    # Exception for Demo Order
    db.add(models.ExceptionLog(
        order_id=demo_order.id,
        issue_type="Inventory mismatch",
        description="SKU: SH-204 not found in main warehouse bin A2",
        status="Open",
        owner="Warehouse Team",
        action="Transfer stock",
        reported_by="System"
    ))
    db.commit()
    
    # Generate 49 other orders to total 50
    # 35 normal, 10 priority, 3 at risk, 2 inventory blocked (we already have 1 priority/blocked)
    # The counts requested: 35 normal, 10 priority, 3 at-risk, 2 inventory blocked. 
    # Let's just generate a mix to match these totals roughly.
    
    for i in range(1, 50):
        # We need 35 normal, 14 priority (10 + 3 at risk + 1 demo = 14 total priority)
        # Wait, the breakdown: 35 normal, 10 priority (not at risk), 3 at-risk priority, 2 blocked.
        if i <= 35:
            priority = "Normal"
            due_time = datetime.now() + timedelta(days=random.randint(1, 3))
            status = random.choice(["Received", "Processing", "Packing", "Staged", "Shipped"])
        elif i <= 45:
            priority = "High"
            due_time = datetime.now() + timedelta(hours=random.randint(5, 24))
            status = random.choice(["Received", "Processing", "Picking", "Packing", "Staged", "Shipped"])
        else:
            # At risk (high priority, due soon, not shipped)
            priority = "High"
            due_time = datetime.now() + timedelta(hours=1)
            status = random.choice(["Processing", "Picking"])
            
        o = models.Order(
            order_number=f"ORD-{1042+i}",
            customer_name=random.choice(names),
            priority=priority,
            status=status,
            due_time=due_time,
            courier_id=random.choice([c1.id, c2.id])
        )
        db.add(o)
        db.commit()
        
        db.add(models.OrderItem(order_id=o.id, product_id=p3.id, quantity=1))
        
        # Second inventory blocked exception
        if i == 49:
            db.add(models.ExceptionLog(
                order_id=o.id,
                issue_type="Wrong variant",
                description="Packed Black instead of White",
                status="Open",
                owner="QA Team",
                action="Repackage order",
                reported_by="QA Inspector"
            ))
            
    db.commit()
    print("Database seeded with Demo Scenario ORD-1042 successfully.")

if __name__ == "__main__":
    seed_db()
