"""initial migration

Revision ID: 609b8b76e8eb
Revises: a2d8d5200a09
Create Date: 2021-04-19 13:04:24.750919

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy.schema import Sequence, CreateSequence


# revision identifiers, used by Alembic.
revision = '609b8b76e8eb'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'candidates',
        sa.Column('id', sa.Integer, autoincrement=False),
        sa.Column('candidate_name', sa.String),
        sa.Column('flag', sa.String),
        sa.Column('max_phase_aact', sa.String),
        sa.Column('max_phase_nct', sa.String),
        sa.Column('found_in_avicenna', sa.String),
        sa.Column('count_in_avicenna', sa.String),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        'nci_codes',
        sa.Column('nci_thesaurus_code', sa.String),
        sa.Column('canonical_name', sa.String),
        sa.PrimaryKeyConstraint("nci_thesaurus_code"),
    )
    op.create_table(
        'nci_information',
        sa.Column('art_id', sa.Integer, autoincrement=False),
        sa.Column('id', sa.Integer),
        sa.Column('candidate_name', sa.String),
        sa.Column('nci_thesaurus_code', sa.String),
        sa.PrimaryKeyConstraint("art_id"),
        sa.ForeignKeyConstraint(
            ["id"],
            ["candidates.id"],
            name='nci_fk'
        ),
        sa.ForeignKeyConstraint(
            ["nci_thesaurus_code"],
            ["nci_codes.nci_thesaurus_code"],
        ),
    )
    op.create_table(
        'fda_information',
        sa.Column('art_id', sa.Integer, autoincrement=False),
        sa.Column('drug_name', sa.String),
        sa.Column('nci_thesaurus_code', sa.String),
        sa.Column('drug_application', sa.String),
        sa.Column('fda_label_date', sa.String),
        sa.Column('fda_label_link', sa.String),
        sa.PrimaryKeyConstraint("art_id"),
        sa.ForeignKeyConstraint(
            ["nci_thesaurus_code"],
            ["nci_codes.nci_thesaurus_code"],
        ),
    )
    op.create_table(
        'clinicaltrials_information',
        sa.Column('id', sa.Integer),
        sa.Column('candidate_name', sa.String),
        sa.Column('nct_id', sa.String),
        sa.Column('nct_phase', sa.String),
        sa.Column('brief_title', sa.String),
        sa.Column('interventions_w_candidate', sa.String),
        sa.ForeignKeyConstraint(
            ["id"],
            ["candidates.id"],
            name='clinical_fk'
        ),
    )
    op.create_primary_key(
        "clinical_pk", "clinicaltrials_information",
        ["id", "brief_title"]
    )
    op.create_table(
        'nct_batch',
        sa.Column('nct_batch_id', sa.Integer, autoincrement=False),
        sa.Column('label', sa.String),
        sa.Column('batch_creation_date', sa.String),
        sa.Column('batch_period_start', sa.String),
        sa.Column('batch_period_end', sa.String),
        sa.PrimaryKeyConstraint("nct_batch_id"),
    )
    op.execute(
        f"""INSERT INTO nct_batch VALUES (-1, 'Blacklist Migration Batch', '{str(datetime.now())}', 'very long ago', 'very long ago');""")
    op.create_table(
        'nct_sources',
        sa.Column('art_id', sa.Integer, autoincrement=False),
        sa.Column('id', sa.Integer),
        sa.Column('candidate_name', sa.String),
        sa.Column('sentences', sa.String),
        sa.Column('nct_id', sa.String),
        sa.Column('nct_batch_id', sa.Integer),
        sa.PrimaryKeyConstraint("art_id"),
        sa.ForeignKeyConstraint(
            ["id"],
            ["candidates.id"],
            name='nct_fk'
        ),
        sa.ForeignKeyConstraint(
            ["nct_batch_id"],
            ["nct_batch.nct_batch_id"],
        ),
    )
    op.create_table(
        'nci_synonyms',
        sa.Column('id', sa.Integer, autoincrement=False),
        sa.Column('nci_thesaurus_code', sa.String),
        sa.Column('term', sa.String),
        sa.Column('source', sa.String),
        sa.Column('type', sa.String),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["nci_thesaurus_code"],
            ["nci_codes.nci_thesaurus_code"],
        ),
    )
    op.create_table(
        'abstracts',
        sa.Column('art_id', sa.Integer, autoincrement=False),
        sa.Column('abstract_id', sa.String),
        sa.Column('conference_name', sa.String),
        sa.Column('conference_date', sa.String),
        sa.Column('local_path', sa.String),
        sa.Column('abstract_title', sa.String),
        sa.PrimaryKeyConstraint("art_id"),
        sa.UniqueConstraint("abstract_id"),
    )
    op.create_table(
        'abstract_batch',
        sa.Column('abstract_batch_id', sa.Integer, autoincrement=False),
        sa.Column('label', sa.String),
        sa.Column('batch_creation_date', sa.String),
        sa.PrimaryKeyConstraint("abstract_batch_id"),
    )
    op.create_table(
        'abstract_sources',
        sa.Column('art_id', sa.Integer, autoincrement=False),
        sa.Column('id', sa.Integer),
        sa.Column('candidate_name', sa.String),
        sa.Column('sentences', sa.String),
        sa.Column('abstract_id', sa.String),
        sa.Column('abstract_batch', sa.Integer),
        sa.PrimaryKeyConstraint("art_id"),
        sa.ForeignKeyConstraint(
            ["id"],
            ["candidates.id"],
            name='abstracts_fk'
        ),
        sa.ForeignKeyConstraint(
            ["abstract_id"],
            ["abstracts.abstract_id"],
            name='abstracts_fk1'
        ),
        sa.ForeignKeyConstraint(
            ["abstract_batch"],
            ["abstract_batch.abstract_batch_id"],
        ),

    )
    op.execute(CreateSequence(Sequence('abs_batches_seq')))
    op.execute(CreateSequence(Sequence('abs_sources_seq')))
    op.execute(CreateSequence(Sequence('abstracts_seq')))
    op.execute(CreateSequence(Sequence('batches_seq')))
    op.execute(CreateSequence(Sequence('candidates_seq')))
    op.execute(CreateSequence(Sequence('fda_seq')))
    op.execute(CreateSequence(Sequence('nci_seq')))
    op.execute(CreateSequence(Sequence('nct_seq')))
    op.execute(CreateSequence(Sequence('synonyms_seq')))

def downgrade():
    pass
