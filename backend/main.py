from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import database
import models
import schemas
from datetime import datetime, date

database.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dashboard", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(database.get_db)):
    total_orders = db.query(models.Order).count()
    priority = db.query(models.Order).filter(models.Order.priority == 'High').count()
    
    # At risk: High priority, not shipped/staged, due within 4 hours
    now = datetime.now()
    four_hours_from_now = now + timedelta(hours=4)
    at_risk = db.query(models.Order).filter(
        models.Order.priority == 'High',
        models.Order.status.not_in(['Staged', 'Shipped']),
        models.Order.due_time <= four_hours_from_now
    ).count()
    
    issues = db.query(models.ExceptionLog).filter(models.ExceptionLog.status != 'Resolved').count()
    
    pipeline = {
        "Received": db.query(models.Order).filter(models.Order.status == 'Received').count(),
        "Processing": db.query(models.Order).filter(models.Order.status == 'Processing').count(),
        "Picking": db.query(models.Order).filter(models.Order.status == 'Picking').count(),
        "Packing": db.query(models.Order).filter(models.Order.status == 'Packing').count(),
        "Staged": db.query(models.Order).filter(models.Order.status == 'Staged').count(),
        "Shipped": db.query(models.Order).filter(models.Order.status == 'Shipped').count(),
    }

    return {
        "total_orders": total_orders,
        "at_risk": at_risk,
        "priority": priority,
        "issues": issues,
        "pipeline": pipeline
    }

@app.get("/api/orders", response_model=List[schemas.Order])
def get_orders(status: str = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Order)
    if status and status != 'All':
        if status == 'Priority':
            query = query.filter(models.Order.priority == 'High')
        elif status == 'At Risk':
            query = query.filter(models.Order.priority == 'High', models.Order.status.in_(['Processing', 'Picking']))
        elif status == 'Inventory Issue':
            # Simplified: just return those with a specific status or with an exception
            exc_orders = db.query(models.ExceptionLog.order_id).filter(models.ExceptionLog.issue_type == 'Inventory mismatch').all()
            exc_order_ids = [e[0] for e in exc_orders]
            query = query.filter(models.Order.id.in_(exc_order_ids))
        else:
            query = query.filter(models.Order.status == status)
    return query.all()

@app.get("/api/orders/{order_id}", response_model=schemas.Order)
def get_order(order_id: int, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@app.put("/api/orders/{order_id}/status")
def update_order_status(order_id: int, status: str, db: Session = Depends(database.get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = status
    db.commit()
    return {"status": "success"}

@app.get("/api/inventory", response_model=List[schemas.InventoryStatus])
def get_inventory(db: Session = Depends(database.get_db)):
    products = db.query(models.Product).all()
    result = []
    for p in products:
        invs = db.query(models.Inventory).filter(models.Inventory.product_id == p.id).all()
        main_wh = 0
        overflow = 0
        for i in invs:
            if i.warehouse.name == "Main Warehouse":
                main_wh += i.quantity
            else:
                overflow += i.quantity
        
        available = main_wh + overflow
        status = "OK"
        if available == 0:
            status = "OUT"
        elif main_wh == 0 and overflow > 0:
            status = "MOVE"
        elif main_wh < 5:
            status = "LOW"
            
        result.append({
            "sku": p.sku,
            "product_name": p.name,
            "main_warehouse": main_wh,
            "overflow": overflow,
            "available": available,
            "status": status
        })
    return result

@app.post("/api/inventory/transfer")
def transfer_inventory(sku: str, qty: int, db: Session = Depends(database.get_db)):
    # Mock transfer logic
    return {"status": "success"}

@app.get("/api/exceptions", response_model=List[schemas.ExceptionLog])
def get_exceptions(db: Session = Depends(database.get_db)):
    return db.query(models.ExceptionLog).order_by(models.ExceptionLog.id.desc()).all()

@app.put("/api/exceptions/{exc_id}/resolve")
def resolve_exception(exc_id: int, db: Session = Depends(database.get_db)):
    exc = db.query(models.ExceptionLog).filter(models.ExceptionLog.id == exc_id).first()
    if not exc:
        raise HTTPException(status_code=404, detail="Exception not found")
    exc.status = "Resolved"
    db.commit()
    return {"status": "success"}
