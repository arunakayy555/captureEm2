import React, { useState } from 'react';
import {
  Plus,
  Archive,
  CheckSquare,
  Square,
  Play,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    addProject,
    toggleProjectStatus,
    toggleMilestone,
    addMilestone,
    startFocusWithTask,
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [milestonesInput, setMilestonesInput] = useState('');

  // Milestone adding per project
  const [addingMilestoneProjId, setAddingMilestoneProjId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones = milestonesInput
      .split('\n')
      .map((m) => m.trim())
      .filter((m) => m.length > 0);

    addProject(title.trim(), description.trim(), milestones);
    setTitle('');
    setDescription('');
    setMilestonesInput('');
    setIsCreating(false);
  };

  const handleAddMilestone = (projectId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    addMilestone(projectId, newMilestoneTitle.trim());
    setNewMilestoneTitle('');
    setAddingMilestoneProjId(null);
  };

  const activeProjects = projects.filter((p) => p.status === 'active');
  const shelfProjects = projects.filter((p) => p.status === 'shelf');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-light-border/80 dark:border-night-border/80 pb-6">
        <div>
          <h1 className="font-serif italic font-semibold text-4xl sm:text-5xl text-light-text dark:text-night-text tracking-tight">
            things i'm making
          </h1>
          <p className="font-serif italic font-medium text-xl sm:text-2xl text-light-muted dark:text-night-muted mt-1">
            creative projects and things bigger than a single task
          </p>
        </div>

        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg text-xs sm:text-sm font-semibold hover:opacity-90 transition-all shadow-sm btn-clean"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>new project</span>
          </button>
        )}
      </div>

      {/* Inline Create Project Form */}
      {isCreating && (
        <form
          onSubmit={handleCreateProject}
          className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-6 space-y-4 shadow-sm animate-fadeIn"
        >
          <span className="text-xs uppercase tracking-widest font-bold text-pastel-mauve-ink dark:text-pastel-mauve">
            start a new project
          </span>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="project title (e.g. Photography Series, Personal Website, EP)"
            autoFocus
            className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl text-base font-medium focus:outline-none focus:ring-1 focus:ring-pastel-mauve"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what is this project about? (brief vision or description)"
            rows={2}
            className="w-full px-4 py-3 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text placeholder:text-light-muted/60 dark:placeholder:text-night-muted/60 border-2 border-light-border dark:border-night-border rounded-2xl focus:outline-none focus:ring-1 focus:ring-pastel-mauve resize-none leading-relaxed"
          />

          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-light-muted dark:text-night-muted block mb-1.5">
              milestones (one per line, optional)
            </span>
            <textarea
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              placeholder="Scout locations&#10;Take 50 raw captures&#10;Color grade hero shots"
              rows={3}
              className="w-full px-4 py-2.5 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-2xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-light-border/60 dark:border-night-border/60">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-5 py-2.5 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-40 btn-clean shadow-xs"
            >
              create project
            </button>
          </div>
        </form>
      )}

      {/* SECTION 1: ACTIVE PROJECTS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between pb-1.5 border-b-2 border-light-border/80 dark:border-night-border/80">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm uppercase tracking-widest font-bold text-pastel-mauve-ink dark:text-pastel-mauve">
              active
            </h2>
            <span className="text-sm font-serif italic text-light-muted dark:text-night-muted font-medium">
              · currently in progress
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-light-muted dark:text-night-muted">
            {activeProjects.length}
          </span>
        </div>

        {activeProjects.length > 0 ? (
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleStatus={toggleProjectStatus}
                onToggleMilestone={toggleMilestone}
                onStartFocus={startFocusWithTask}
                onAddMilestoneSubmit={handleAddMilestone}
                isAddingMilestone={addingMilestoneProjId === project.id}
                setIsAddingMilestone={(val) =>
                  setAddingMilestoneProjId(val ? project.id : null)
                }
                newMilestoneTitle={newMilestoneTitle}
                setNewMilestoneTitle={setNewMilestoneTitle}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm font-serif italic text-light-muted dark:text-night-muted pl-1">
            no active projects right now.
          </p>
        )}
      </section>

      {/* SECTION 2: SHELF */}
      <section className="space-y-4 pt-6 border-t-2 border-light-border/80 dark:border-night-border/80">
        <div className="flex items-center justify-between pb-1.5 border-b-2 border-light-border/80 dark:border-night-border/80">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm uppercase tracking-widest font-bold text-pastel-sage-ink dark:text-pastel-sage">
              shelf
            </h2>
            <span className="text-sm font-serif italic text-light-muted dark:text-night-muted font-medium">
              · resting for later
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-light-muted dark:text-night-muted">
            {shelfProjects.length}
          </span>
        </div>

        {shelfProjects.length > 0 ? (
          <div className="space-y-4">
            {shelfProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onToggleStatus={toggleProjectStatus}
                onToggleMilestone={toggleMilestone}
                onStartFocus={startFocusWithTask}
                onAddMilestoneSubmit={handleAddMilestone}
                isAddingMilestone={addingMilestoneProjId === project.id}
                setIsAddingMilestone={(val) =>
                  setAddingMilestoneProjId(val ? project.id : null)
                }
                newMilestoneTitle={newMilestoneTitle}
                setNewMilestoneTitle={setNewMilestoneTitle}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm font-serif italic text-light-muted dark:text-night-muted pl-1">
            no shelved projects.
          </p>
        )}
      </section>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  onToggleStatus: (id: string) => void;
  onToggleMilestone: (projectId: string, milestoneId: string) => void;
  onStartFocus: (taskTitle: string, duration?: number, taskId?: string, projectId?: string) => void;
  onAddMilestoneSubmit: (projectId: string, e: React.FormEvent) => void;
  isAddingMilestone: boolean;
  setIsAddingMilestone: (val: boolean) => void;
  newMilestoneTitle: string;
  setNewMilestoneTitle: (val: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onToggleStatus,
  onToggleMilestone,
  onStartFocus,
  onAddMilestoneSubmit,
  isAddingMilestone,
  setIsAddingMilestone,
  newMilestoneTitle,
  setNewMilestoneTitle,
}) => {
  const [expanded, setExpanded] = useState(true);

  const completedMilestones = project.milestones.filter((m) => m.completed).length;
  const totalMilestones = project.milestones.length;

  return (
    <div className="bg-light-surface dark:bg-night-surface border-2 border-light-border dark:border-night-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif italic font-semibold text-2xl sm:text-3xl text-light-text dark:text-night-text">
            {project.title}
          </h3>
          {project.description && (
            <p className="text-sm text-light-muted dark:text-night-muted mt-1.5 leading-relaxed font-normal">
              {project.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onStartFocus(`Work on ${project.title}`, 45, undefined, project.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-light-bg dark:bg-night-elevated text-xs sm:text-sm font-semibold text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border hover:border-pastel-yellow transition-all btn-clean"
            title="Focus session on project"
          >
            <Play className="w-3.5 h-3.5 fill-current text-pastel-yellow-ink dark:text-pastel-yellow" />
            <span className="hidden sm:inline">focus</span>
          </button>

          <button
            onClick={() => onToggleStatus(project.id)}
            className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated border-2 border-transparent hover:border-light-border dark:hover:border-night-border transition-all btn-clean"
            title={project.status === 'active' ? 'Move to shelf' : 'Activate project'}
          >
            <Archive className="w-4 h-4 stroke-[2]" />
          </button>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text hover:bg-light-bg dark:hover:bg-night-elevated transition-colors btn-clean"
          >
            {expanded ? <ChevronUp className="w-4 h-4 stroke-[2]" /> : <ChevronDown className="w-4 h-4 stroke-[2]" />}
          </button>
        </div>
      </div>

      {/* Progress & Milestones */}
      {expanded && (
        <div className="space-y-3.5 pt-3.5 border-t-2 border-light-border/70 dark:border-night-border/70">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-light-muted dark:text-night-muted font-semibold uppercase tracking-wider">milestones</span>
            {totalMilestones > 0 && (
              <span className="font-mono text-xs font-bold text-light-muted dark:text-night-muted">
                {completedMilestones}/{totalMilestones} done
              </span>
            )}
          </div>

          {/* Milestones checklist */}
          <div className="space-y-2">
            {project.milestones.map((m) => (
              <div
                key={m.id}
                onClick={() => onToggleMilestone(project.id, m.id)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-light-bg/80 dark:hover:bg-night-elevated/80 cursor-pointer transition-colors"
              >
                {m.completed ? (
                  <CheckSquare className="w-5 h-5 text-pastel-sage-ink dark:text-pastel-sage stroke-[2.2] shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-light-muted dark:text-night-muted stroke-[2] shrink-0" />
                )}
                <span
                  className={`text-sm font-medium ${
                    m.completed
                      ? 'line-through text-light-muted dark:text-night-muted'
                      : 'text-light-text dark:text-night-text'
                  }`}
                >
                  {m.title}
                </span>
              </div>
            ))}
          </div>

          {/* Add milestone inline */}
          {isAddingMilestone ? (
            <form onSubmit={(e) => onAddMilestoneSubmit(project.id, e)} className="flex gap-2 pt-1.5">
              <input
                type="text"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                placeholder="new milestone..."
                autoFocus
                className="flex-1 px-3.5 py-2 bg-light-bg dark:bg-night-elevated text-xs sm:text-sm text-light-text dark:text-night-text border-2 border-light-border dark:border-night-border rounded-xl focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-light-text text-light-bg dark:bg-night-text dark:text-night-bg rounded-xl text-xs sm:text-sm font-semibold btn-clean"
              >
                add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="px-3 py-2 text-xs sm:text-sm text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text btn-clean"
              >
                cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingMilestone(true)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-light-muted dark:text-night-muted hover:text-light-text dark:hover:text-night-text pt-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2]" />
              <span>add milestone</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
