import datetime
import json

link_template = 'https://ncit.nci.nih.gov/ncitbrowser/ConceptReport.jsp?dictionary=NCI%20Thesaurus&code='

def get_last_id(cursor, id_type, table):
    cursor.execute(f"""SELECT distinct({id_type}) FROM {table} order by ({id_type})""")
    rows = cursor.fetchall()
    last_id = -2
    if rows != []:
        last_id = rows[-1][0]
    return last_id

def join_duplicates_date(cand_list):
    new_list = []
    saved = [-1, '1999']
    for each in cand_list:
        if each[0] == saved[0]:
            if saved[-1] is not None:
                if each[-1] is not None:
                    if each[-1] > saved[-1]:
                        saved = each
            else:
                if each[-1] is not None:
                    saved = each
        else:
            if saved != [-1, '1999']:
                new_list.append(saved)
            saved = each
    new_list.append(saved)
    return new_list


def get_cand_by_nct_batch(curs, conn, batch, source):
    if source == 'nct':
        curs.execute(f"""SELECT distinct(cand.id),
                                cand.flag,
                                cand.candidate_name,
                                cand.count_in_avicenna,
                                cand.max_phase_aact,
                                finf.fda_label_date
                                from candidates cand
                                LEFT JOIN nci_information ninf on ninf.id = cand.id
                                LEFT JOIN nci_codes ncod on ncod.nci_thesaurus_code = ninf.nci_thesaurus_code
                                LEFT JOIN fda_information finf on finf.nci_thesaurus_code = ncod.nci_thesaurus_code
                                LEFT JOIN nct_sources nsrc on cand.id = nsrc.id
                                LEFT JOIN nct_batch nbtch on nbtch.nct_batch_id = nsrc.nct_batch_id
                                where nbtch.nct_batch_id = {batch}
                                order by (cand.id)""")
        records = curs.fetchall()
        counts = []
        for each_rec in records:
            #print(each_rec)
            s = f"""select count(n.id) from nct_sources n where n.candidate_name = '{each_rec[2]}'"""
            curs.execute(s)
            count = curs.fetchone()
            counts.append(count)
    else:
        curs.execute(f"""SELECT distinct(cand.id),
                                cand.flag,
                                cand.candidate_name,
                                cand.count_in_avicenna,
                                cand.max_phase_aact,
                                finf.fda_label_date
                                from candidates cand
                                LEFT JOIN nci_information ninf on ninf.id = cand.id
                                LEFT JOIN nci_codes ncod on ncod.nci_thesaurus_code = ninf.nci_thesaurus_code
                                LEFT JOIN fda_information finf on finf.nci_thesaurus_code = ncod.nci_thesaurus_code
                                LEFT JOIN abstract_sources nsrc on cand.id = nsrc.id
                                LEFT JOIN abstract_batch nbtch on nbtch.abstract_batch_id = nsrc.abstract_batch
                                where nbtch.abstract_batch_id = {batch}
                                order by (cand.id)""")
        records = curs.fetchall()
        counts = []
        for each_rec in records:
            #print(each_rec)
            s = f"""select count(n.id) from abstract_sources n where n.candidate_name = '{each_rec[2]}'"""
            curs.execute(s)
            count = curs.fetchone()
            counts.append(count)
    curs.close()
    conn.close()
    records = join_duplicates_date(records)
    main_list = []
    for each, count_can in zip(records, counts):
        print(each)
        main_list.append(dictify_candidate(each, count_can))
    return json.dumps({'candidates': main_list}, default=myconverter)


def get_cand_no_batch(curs, conn, source):
    curs.execute(f"""SELECT distinct(cand.id),
                            cand.flag,
                            cand.candidate_name,
                            cand.count_in_avicenna,
                            cand.max_phase_aact,
                            finf.fda_label_date
                            from candidates cand
                            LEFT JOIN nci_information ninf on ninf.id = cand.id
                            LEFT JOIN nci_codes ncod on ncod.nci_thesaurus_code = ninf.nci_thesaurus_code
                            LEFT JOIN fda_information finf on finf.nci_thesaurus_code = ncod.nci_thesaurus_code
                            order by (cand.id) desc""")
    records = curs.fetchall()
    counts = []
    for each_rec in records:
        s = f"""select count(n.id) from nct_sources n where n.candidate_name = '{each_rec[2]}'"""
        curs.execute(s)
        count = curs.fetchone()
        counts.append(count)
    curs.close()
    conn.close()
    records = join_duplicates_date(records)
    main_list = []
    for each, count_can in zip(records, counts):
        print(each)
        main_list.append(dictify_candidate(each, count_can))
    return json.dumps({'candidates': main_list}, default=myconverter)


def get_filtrated_batches(sources, proc_flag, curs, conn):
    result = []
    if sources == 'nct':
        keys_and_tables = ['nct_batch', 'nct_batch_id', 'nct_sources', 'nct_batch_id']
    else:
        keys_and_tables = ['abstract_batch', 'abstract_batch_id', 'abstract_sources', 'abstract_batch']
    curs.execute(
        f"""select {keys_and_tables[1]}, label, batch_creation_date from {keys_and_tables[0]} where {keys_and_tables[1]} != -1 order by {keys_and_tables[1]} desc""")
    records = curs.fetchall()

    source_keys = ('id', 'label', 'creation_date', 'link_self', 'link_candidates', 'batch_fill')
    for each in records:
        each = each + (f'/batches/{each[0]}?source={sources}',)
        each = each + (f'/candidates?source={sources}&batchId={each[0]}',)
        curs.execute(f"""SELECT distinct(cand.id),
                                                cand.flag,
                                                cand.candidate_name,
                                                cand.count_in_avicenna,
                                                cand.max_phase_aact
                                                from candidates cand
                                                LEFT JOIN {keys_and_tables[2]} src on cand.id = src.id
                                                LEFT JOIN {keys_and_tables[0]} btch on btch.{keys_and_tables[1]} = src.{keys_and_tables[3]}
                                                where btch.{keys_and_tables[1]} = {each[0]}
                                                order by (cand.id)""")
        total_cand = curs.fetchall()
        curs.execute(f"""SELECT distinct(cand.id),
                                                cand.flag,
                                                cand.candidate_name,
                                                cand.count_in_avicenna,
                                                cand.max_phase_aact
                                                from candidates cand
                                                LEFT JOIN {keys_and_tables[2]} src on cand.id = src.id
                                                LEFT JOIN {keys_and_tables[0]} btch on btch.{keys_and_tables[1]} = src.{keys_and_tables[3]}
                                                where btch.{keys_and_tables[1]} = {each[0]} and cand.flag = 'Flag.No_flag'
                                                order by (cand.id)""")
        nofl_cand = curs.fetchall()
        if proc_flag == 'true':
            if (len(total_cand) - len(nofl_cand)) == len(total_cand):
                print(str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)))
                each = each + (str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)),)
                result.append(fill_dict(source_keys, each))
        elif proc_flag == 'false':
            if (len(total_cand) - len(nofl_cand)) != len(total_cand):
                print(str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)))
                each = each + (str(len(total_cand) - len(nofl_cand)) + '/' + str(len(total_cand)),)
                result.append(fill_dict(source_keys, each))
    return result


def myconverter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()

def fill_dict(keys, values):
    dictionary = {}
    for key, value in zip(keys, values):
        dictionary.update({key: value})
    return dictionary

def jsonify_date(datestr):
    if (datestr is not None) & (datestr != ''):
        result = datetime.datetime.strptime(datestr, '%Y-%m-%d %H:%M:%S')
        return result
    else:
        return datestr

def join_duplicates_fda(list_of_data):
    fda_keys = ('drugName', 'fdaApplicationNumber', 'fdaLabelLink', 'fdaLabelDate')
    syn_keys = ('Term', 'Source', 'Type')
    gen_keys = ('canonicalName', 'thesaurusLink' ,'fdaApplications', 'canonicalNameSynonyms')
    current_canon = ''
    current_link = ''
    current_fda_list = []
    current_synlist = []
    current_fda = []
    result_list = []

    for each_data in list_of_data:
            if each_data[0] == current_canon:
                if each_data[6] == current_fda[1]:
                    current_synlist.append(fill_dict(syn_keys, [each_data[2], each_data[3], each_data[4]]))
                else:
                    if current_fda != []:
                        current_fda_list.append(fill_dict(fda_keys, current_fda))
                    current_synlist.append(fill_dict(syn_keys, [each_data[2], each_data[3], each_data[4]]))
                    current_fda = [each_data[5], each_data[6], each_data[8], jsonify_date(each_data[7])]
                    #print('wrote fda for ' + current_canon)
                    #print(current_fda)
            else:
                current_fda_list.append(fill_dict(fda_keys, current_fda))
                if current_fda_list == []:
                    current_fda_list.append(fill_dict(fda_keys, ['', '', '', '']))
                if current_canon != '':
                    result_list.append(fill_dict(gen_keys, [current_canon, link_template+current_link,current_fda_list, current_synlist]))
                #if current_fda != []:
                    #print(current_fda_list)
                    #print('changing ' + current_fda[1] + ' to ' + str(each_data[5]))
                current_fda_list = []
                current_fda = [each_data[5], each_data[6], each_data[8], jsonify_date(each_data[7])]
                current_canon = each_data[0]
                current_link = each_data[1]
                current_synlist = [fill_dict(syn_keys, [each_data[2], each_data[3], each_data[4]])]

    if current_fda_list == []:
        current_fda_list.append(fill_dict(fda_keys, ['', '', '', '']))
    if current_canon is not None:
        result_list.append(fill_dict(gen_keys, [current_canon, link_template+current_link, current_fda_list, current_synlist]))
    # else:
    #     result_list.append(fill_dict(gen_keys, ['', '', current_fda_list, current_synlist]))
    #print(result_list)
    return result_list

def dictify_candidate(data_list, count):
    key_list = ('candidateId', 'flag', 'candidate','nctCount','avicennaCount','maxPhase','fdaLabelDate')
    return fill_dict(key_list, [data_list[0], data_list[1], data_list[2], count[0],data_list[3],data_list[4],jsonify_date(data_list[5])])

def dictify_candidate_info(source_type, batch_id, id, candidate_name, bl_flag, source, max_drug_phase, clinicaltrials, nci_fda, avicenna):
    clinicaltrial_info_list = []
    sources_list = []
    ash_sources_keys = ('abstractId', 'internalLink','abstractTitle', 'sentence', 'conferenceInfo')
    nct_sources_keys = ('nctId', 'nctBriefTitle', 'nctSentence')
    max_drug_phase_info_keys = ('nctId', 'nctBriefTitle', 'nctMaxPhase')
    avicenna_keys = ('count', 'drugName')
    clinicaltrial_info_keys = ('nctId', 'nctBriefTitle', 'nctPhase', 'nctInterventions')
    base_keys = ('sourceType', 'batchId', 'candidateId', 'candidateName',  'flag',  'sourceInformation', 'maxDrugPhaseInformation', 'clinicalTrialsInformation', 'nciInformation', 'foundInAvicennaInformation')
    if source_type == 'nct':
        for each_source in source:
            sources_list.append(fill_dict(nct_sources_keys, each_source))
    else:
        for each_source in source:
            sources_list.append(fill_dict(ash_sources_keys, (each_source[0], each_source[5], each_source[1], each_source[2], each_source[3] + ' ' + each_source[4])))
    avicenna_dict = fill_dict(avicenna_keys, avicenna)
    max_drug_phase_info_dict = [fill_dict(max_drug_phase_info_keys, max_drug_phase)]
    for each_ct in clinicaltrials:
        clinicaltrial_info_list.append(fill_dict(clinicaltrial_info_keys, each_ct))

    fda_info = join_duplicates_fda(nci_fda)
    return fill_dict(base_keys, [source_type, batch_id, id, candidate_name, bl_flag, sources_list, max_drug_phase_info_dict, clinicaltrial_info_list, fda_info, avicenna_dict])
