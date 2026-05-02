from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from auth import get_current_user, require_admin, CurrentUser
from database import get_db

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=schemas.ProjectOut, status_code=201)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    project = models.Project(
        name=data.name,
        description=data.description,
        owner_id=current_user.id,
    )
    db.add(project)
    db.flush()

    # owner auto-added as admin member
    db.add(models.ProjectMember(project_id=project.id, user_id=current_user.id, role="admin"))
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: CurrentUser = Depends(get_current_user)):
    memberships = db.query(models.ProjectMember).filter(models.ProjectMember.user_id == current_user.id).all()
    ids = [m.project_id for m in memberships]
    return db.query(models.Project).filter(models.Project.id.in_(ids)).all()


@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: CurrentUser = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == current_user.id,
    ).first()
    if not member:
        raise HTTPException(status_code=403, detail="Access denied")

    return project


@router.post("/{project_id}/members", status_code=201)
def add_member(
    project_id: int,
    data: schemas.MemberAdd,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can manage members")

    if db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == data.user_id,
    ).first():
        raise HTTPException(status_code=400, detail="Already a member")

    db.add(models.ProjectMember(project_id=project_id, user_id=data.user_id, role=data.role))
    db.commit()
    return {"message": "Member added"}


@router.delete("/{project_id}/members/{user_id}")
def remove_member(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only project owner can manage members")

    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    db.delete(member)
    db.commit()
    return {"message": "Member removed"}
