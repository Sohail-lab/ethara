from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

import models
import schemas
from auth import get_current_user, require_admin, CurrentUser
from database import get_db

router = APIRouter(tags=["tasks"])


@router.post("/projects/{project_id}/tasks", response_model=schemas.TaskOut, status_code=201)
def create_task(
    project_id: int,
    data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can create tasks")

    task = models.Task(
        project_id=project_id,
        title=data.title,
        description=data.description,
        assigned_to=data.assigned_to,
        due_date=data.due_date,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/projects/{project_id}/tasks", response_model=List[schemas.TaskOut])
def get_tasks(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id,
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Not a member")

    return db.query(models.Task).filter(models.Task.project_id == project_id).all()


@router.patch("/tasks/{task_id}/status", response_model=schemas.TaskOut)
def update_status(
    task_id: int,
    data: schemas.TaskStatusUpdate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    if data.status not in ("todo", "in-progress", "done"):
        raise HTTPException(status_code=400, detail="Invalid status value")

    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.role == "member" and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="Can only update your own tasks")

    task.status = data.status
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks/overdue", response_model=List[schemas.TaskOut])
def get_overdue(
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    today = date.today()

    if current_user.role == "admin":
        owned_ids = [
            p.id for p in db.query(models.Project).filter(models.Project.owner_id == current_user.id).all()
        ]
        return db.query(models.Task).filter(
            models.Task.project_id.in_(owned_ids),
            models.Task.due_date < today,
            models.Task.status != "done",
        ).all()

    return db.query(models.Task).filter(
        models.Task.assigned_to == current_user.id,
        models.Task.due_date < today,
        models.Task.status != "done",
    ).all()
