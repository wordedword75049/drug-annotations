from enum import Enum
from flask import Flask, request, Response
import psycopg2
import json
import os
from service_functions import dictify_candidate, dictify_candidate_info, myconverter, get_last_id, get_cand_by_nct_batch, fill_dict, get_cand_no_batch, get_filtrated_batches


app = Flask(__name__)
db_host = os.environ.get("DB_HOST", "localhost")
db_name = os.environ.get("DB_NAME", "drug-annotations")
db_username = os.environ.get("DB_USERNAME", "postgres")
db_password = os.environ.get("DB_PASSWORD", "12345")
conn_string = f"host='{db_host}' dbname='{db_name}' user='{db_username}' password='{db_password}'"


class Flag(Enum):
    No_flag = -1
    TP = 1
    FP = 2
    black_list = 3

@app.route('/')
def hello():
    return "Hello World!"


@app.route('/update', methods = ['PUT', 'GET'])
def update_flag():
    id_c= request.args.get('id', None)
    new_flag = request.args.get('nflag', None)
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    if new_flag == 'tp':
        curs.execute(f"""update candidates set flag = '{Flag.TP}' where id = {id_c}""")
    elif new_flag == 'bl':
        curs.execute(f"""update candidates set flag = '{Flag.black_list}' where id = {id_c}""")
    elif new_flag == 'fp':
        curs.execute(f"""update candidates set flag = '{Flag.FP}' where id = {id_c}""")
    elif new_flag == 'none':
        curs.execute(f"""update candidates set flag = '{Flag.No_flag}' where id = {id_c}""")
    curs.execute("COMMIT")
    return "Updated " + str(id_c) + "`s flag to " + new_flag


@app.route('/multiple_update', methods = ['PUT', 'GET'])
def update_many_flag():
    begin_dict = request.json
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    new_flag = begin_dict['drugStatus']
    flag_ins = Flag.No_flag
    if new_flag == 'tp':
        flag_ins = Flag.TP
    elif new_flag == 'blackList':
        flag_ins = Flag.black_list
    elif new_flag == 'fp':
        flag_ins = Flag.FP
    elif new_flag == 'none':
        flag_ins = Flag.No_flag
    for each_id in begin_dict['drugList']:
        curs.execute(f"""update candidates set flag = '{flag_ins}' where id = {each_id}""")
        print("Updated " + str(each_id) + "`s flag to " + str(flag_ins))
    curs.execute("COMMIT")
    return "ok"


@app.route('/healthcheck')
def healthcheck():
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    curs.execute(
        f"""SELECT *
            from candidates c
            LIMIT 1""")
    check_list = curs.fetchone()
    curs.close()
    conn.close()
    return Response(json.dumps({'base_check_response': check_list}), mimetype='application/json')


@app.route('/sources')
def sources():
    res_list = []
    source_keys = ('id', 'label', 'link_self')
    nct_data = ('nct', 'NCT', '/sources/nct')
    res_list.append(fill_dict(source_keys, nct_data))
    conf_data = ('conference', 'Conference', '/sources/conference')
    res_list.append(fill_dict(source_keys, conf_data))
    return Response(json.dumps({'sources': res_list}), mimetype='application/json')

@app.route('/sources/<id>')
def exact_source(id):
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    if id == 'nct':
        source_keys = ('id', 'label', 'useBatchMode', 'link_self', 'link_batches', 'link_latest_batch', 'link_latest_candidates', 'link_latest_unprocessed_batch', 'link_latest_unprocessed_candidates')
        last_id = get_last_id(curs, 'nct_batch_id', 'nct_batch')
        unprocessed_info = get_filtrated_batches(id, 'false', curs, conn)
        if unprocessed_info == []:
            unprocessed_info = [{'id': -2}]
        id_data = (id, 'NCT', True, '/sources/nct', '/batches?source=nct', f'/batches/{last_id}?source=nct', f'/candidates?source=nct&batchId={last_id}', f"""/batches/{unprocessed_info[0]['id']}?source=nct""", f"""/candidates?source=nct&batchId={unprocessed_info[0]['id']}""")
    else:
        last_id = get_last_id(curs, 'abstract_batch_id', 'abstract_batch')
        source_keys = ('id', 'label', 'useBatchMode', 'link_self', 'link_latest_batch', 'link_latest_candidates', 'link_latest_unprocessed_batch', 'link_latest_unprocessed_candidates')
        unprocessed_info = get_filtrated_batches(id, 'false', curs, conn)
        if unprocessed_info == []:
            unprocessed_info = [{'id': -2}]
        id_data = ('conference', 'Conference', False, '/sources/conference', f'/batches/{last_id}?source=abstract', f'/candidates?source=abstract&batchId={last_id}', f"""/batches/{unprocessed_info[0]['id']}?source=abstract""", f"""/candidates?source=abstract&batchId={unprocessed_info[0]['id']}""")

    result = fill_dict(source_keys, id_data)
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/batches', methods = ['GET'])
def batch_list():
    source = request.args.get('source', None)
    proc_flag = request.args.get('showProcessed', 'false')
    print(type(proc_flag))
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    result = get_filtrated_batches(source, proc_flag, curs, conn)
    curs.close()
    conn.close()
    return Response(json.dumps({'batches': result}), mimetype='application/json')


@app.route('/batches/<id>', methods = ['GET'])
def batch(id):
    source = request.args.get('source', None)
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    if source == 'nct':
        curs.execute(
            f"""SELECT distinct(nct_batch_id),
                label,
                batch_creation_date,
                batch_period_start,
                batch_period_end
                from nct_batch
                where nct_batch_id = {id}
                order by (nct_batch_id)""")
        batch = curs.fetchone()
        source_keys = ('id', 'label', 'creation_date', 'period_start', 'period_end', 'link_self', 'link_candidates', 'batch_fill')
        if batch is not None:
            batch = batch + (f'/batches/{batch[0]}?source=nct',)
            batch = batch + (f'/candidates?source=nct&batchId={batch[0]}',)
            curs.execute(f"""SELECT distinct(cand.id),
                                                        cand.flag,
                                                        cand.candidate_name,
                                                        cand.count_in_avicenna,
                                                        cand.max_phase_aact
                                                        from candidates cand
                                                        LEFT JOIN nct_sources nsrc on cand.id = nsrc.id
                                                        LEFT JOIN nct_batch nbtch on nbtch.nct_batch_id = nsrc.nct_batch_id
                                                        where nbtch.nct_batch_id = {batch[0]}
                                                        order by (cand.id)""")
            total_cand = curs.fetchall()
            curs.execute(f"""SELECT distinct(cand.id),
                                                                    cand.flag,
                                                                    cand.candidate_name,
                                                                    cand.count_in_avicenna,
                                                                    cand.max_phase_aact
                                                                    from candidates cand
                                                                    LEFT JOIN nct_sources nsrc on cand.id = nsrc.id
                                                                    LEFT JOIN nct_batch nbtch on nbtch.nct_batch_id = nsrc.nct_batch_id
                                                                    where nbtch.nct_batch_id = {batch[0]} and cand.flag = 'Flag.No_flag'
                                                                    order by (cand.id)""")
            nofl_cand = curs.fetchall()
            batch = batch + (str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)),)
            result = fill_dict(source_keys, batch)
        else:
            result = 'No such batch'
    else:
        curs.execute(
            f"""SELECT distinct(abstract_batch_id),
                label,
                batch_creation_date
                from abstract_batch
                where abstract_batch_id = {id}
                order by (abstract_batch_id)""")
        batch = curs.fetchone()
        source_keys = ('id', 'label', 'creation_date', 'link_self', 'link_candidates', 'batch_fill')
        if batch is not None:
            batch = batch + (f'/batches/{batch[0]}?source=abstract',)
            batch = batch + (f'/candidates?source=abstract&batchId={batch[0]}',)
            curs.execute(f"""SELECT distinct(cand.id),
                                                        cand.flag,
                                                        cand.candidate_name,
                                                        cand.count_in_avicenna,
                                                        cand.max_phase_aact
                                                        from candidates cand
                                                        LEFT JOIN abstract_sources nsrc on cand.id = nsrc.id
                                                        LEFT JOIN abstract_batch nbtch on nbtch.abstract_batch_id = nsrc.abstract_batch
                                                        where nbtch.abstract_batch_id = {batch[0]}
                                                        order by (cand.id)""")
            total_cand = curs.fetchall()
            curs.execute(f"""SELECT distinct(cand.id),
                                                                   cand.flag,
                                                                   cand.candidate_name,
                                                                   cand.count_in_avicenna,
                                                                   cand.max_phase_aact
                                                                   from candidates cand
                                                                   LEFT JOIN abstract_sources nsrc on cand.id = nsrc.id
                                                                   LEFT JOIN abstract_batch nbtch on nbtch.abstract_batch_id = nsrc.abstract_batch
                                                                   where nbtch.abstract_batch_id = {batch[0]} and cand.flag = 'Flag.No_flag'
                                                                    order by (cand.id)""")
            nofl_cand = curs.fetchall()
            batch = batch + (str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)),)
            result = fill_dict(source_keys, batch)
        else:
            result = 'No such batch'
    curs.close()
    conn.close()
    return Response(json.dumps(result), mimetype='application/json')


@app.route('/candidates', methods = ['GET'])
def drugs():
    source = request.args.get('source', None)
    batch = request.args.get('batchId', None)
    print(source, batch)

    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    if (source is not None) & (batch is not None):
        return Response(get_cand_by_nct_batch(curs, conn, batch, source), mimetype='application/json')
    elif source is not None:
        return Response(get_cand_no_batch(curs, conn, source), mimetype='application/json')
    else:
        return Response("Waiting for source choice", mimetype='application/json')



@app.route('/id_window', methods=['GET'])
def pred_and_next():
    target = request.args.get('target')
    target = int(target)
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()
    curs.execute(f"""select count(*) from abstract_sources abss where abss.id = {target}""")
    try_abs = curs.fetchone()
    if try_abs[0] == 0:  # NCT
        curs.execute(f"""select LAG(ident) OVER(ORDER BY ident),
                                ident,
                                LEAD(ident) OVER(ORDER BY ident)
                                from (select distinct(id) ident
                                        from nct_sources ncts
                                        where ncts.nct_batch_id = (select distinct(nct_batch_id)
                                                                    from nct_sources where id = {target})
                                        ORDER BY id)
                                as id_table""")

        all_windows = curs.fetchall()
    else:
        curs.execute(f"""select LAG(ident) OVER(ORDER BY ident),
                                        ident,
                                        LEAD(ident) OVER(ORDER BY ident)
                                        from (select distinct(id) ident
                                                from abstract_sources abss
                                                where abss.abstract_batch = (select distinct(abstract_batch)
                                                                            from abstract_sources where id = {target})
                                                ORDER BY id)
                                        as id_table""")

        all_windows = curs.fetchall()
    index = [s[1] for s in all_windows].index(target)
    element = all_windows[index]
    return {'prev': element[0], 'next': element[2]}


@app.route('/candidates/<id>')
def drug_by_id(id):
    print('Connecting to candidates database')
    conn = psycopg2.connect(conn_string)
    print('Connected!')
    curs = conn.cursor()

    curs.execute(f"""select count(*) from abstract_sources abss where abss.id = {id}""")
    try_abs = curs.fetchone()

    curs.execute(f"""select count(*) from nct_sources abss where abss.id = {id}""")
    try_nct = curs.fetchone()

    if try_abs[0] == 0:
        source_type = 'nct'
        curs.execute(f"""select abss.nct_batch_id from nct_sources abss where abss.id = {id}""")
        source_batch = curs.fetchone()[0]

    else:
        source_type = 'abstracts'
        curs.execute(f"""select abss.abstract_batch from abstract_sources abss where abss.id = {id}""")
        source_batch = curs.fetchone()[0]

    if source_type == 'nct':
        curs.execute(f"""SELECT n.nct_id, ct.brief_title, n.sentences from candidates cand LEFT JOIN nct_sources n on n.id = cand.id LEFT JOIN clinicaltrials_information ct on ct.nct_id = n.nct_id where cand.id = {id}""")
        nct_sources = curs.fetchall()
    else:
        curs.execute(
            f"""SELECT n.abstract_id, ct.abstract_title, n.sentences, ct.conference_name, ct.conference_date, ct.local_path from candidates cand LEFT JOIN abstract_sources n on n.id = cand.id LEFT JOIN abstracts ct on ct.abstract_id = n.abstract_id where cand.id = {id}""")
        nct_sources = curs.fetchall()

    curs.execute(
        f"""SELECT ct.nct_id, ct.brief_title, ct.nct_phase from candidates cand LEFT JOIN clinicaltrials_information ct on ct.id = cand.id where cand.id = {id} and ct.nct_id = cand.max_phase_nct""")
    max_drug_phase_info = curs.fetchone()
    if max_drug_phase_info is None:
        max_drug_phase_info = ['-', '-', '-']

    curs.execute(
        f"""SELECT cand.flag, cand.candidate_name from candidates cand where cand.id = {id}""")
    flag_info = curs.fetchone()

    curs.execute(
        f"""SELECT ct.nct_id, ct.brief_title, ct.nct_phase, ct.interventions_w_candidate from candidates cand LEFT JOIN clinicaltrials_information ct on ct.id = cand.id where cand.id = {id}""")
    clinicaltrial_info = curs.fetchall()

    curs.execute(
         f"""select
            ncodes.canonical_name,
            ncodes.nci_thesaurus_code,
            nsyns.term,
            nsyns.source,
            nsyns.type,
            fdainf.drug_name,
            fdainf.drug_application,
            fdainf.fda_label_date,
            fdainf.fda_label_link
            from candidates cand
            left join nci_information ninf on cand.id = ninf.id
            left join nci_codes ncodes on ninf.nci_thesaurus_code = ncodes.nci_thesaurus_code
            left join nci_synonyms nsyns on nsyns.nci_thesaurus_code = ncodes.nci_thesaurus_code
            left join fda_information fdainf on fdainf.nci_thesaurus_code = ncodes.nci_thesaurus_code
            where cand.id = {id}""")
    nci_info = curs.fetchall()

    curs.execute(
        f"""SELECT cand.count_in_avicenna, cand.found_in_avicenna from candidates cand where cand.id = {id}""")
    avicenna_info = curs.fetchone()


    curs.close()
    conn.close()
    # counts = []
    # for each, count_can in zip(records, counts):
    #     main_list.append(dictify_candidate_info(each, count_can))
    dictified_records = dictify_candidate_info(source_type, source_batch, id, flag_info[1], flag_info[0], nct_sources, max_drug_phase_info, clinicaltrial_info, nci_info, avicenna_info)
    return Response(json.dumps(dictified_records, default = myconverter), mimetype='application/json')


if __name__ == '__main__':
    app.run()
